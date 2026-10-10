from datetime import date, datetime
from typing import Literal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from src.incidentes import exceptions, schemas
from src.incidentes.constants import DIAS_UMBRAL_INCIDENTE_DEMORADO, EstadoIncidente
from src.incidentes.models import Incidente
from src.accion_correctiva.models import AccionCorrectiva
from src.tipo_incidente.models import TipoIncidente
from src.incidentes.schemas import IncidentesAbiertosPorTipo
from src.personal.models import Persona
from src.historial_incidente import services as historial_services
from src.historial_incidente.constants import TipoEvento


def _dias_abierto(incidente: Incidente, estado: str, hoy: date | None = None) -> int:
    fecha_fin = (
        incidente.fecha_cierre.date()
        if estado == EstadoIncidente.CERRADO.value and incidente.fecha_cierre
        else (hoy or date.today())
    )
    return max(0, (fecha_fin - incidente.fecha_abierto.date()).days)


def _incidente_a_respuesta(incidente: Incidente, hoy: date | None = None) -> dict:
    tiene_accion_correctiva = any(accion.activo for accion in incidente.acciones_correctivas)
    estado_enum = EstadoIncidente.CERRADO if tiene_accion_correctiva else EstadoIncidente.ABIERTO
    dias_abierto = _dias_abierto(incidente, estado_enum.value, hoy)
    return {
        "id": incidente.id,
        "nombre": incidente.nombre,
        "descripcion": incidente.descripcion,
        "estado": estado_enum.value,
        "fecha": incidente.fecha_abierto,
        "fecha_abierto": incidente.fecha_abierto,
        "fecha_cierre": incidente.fecha_cierre,
        "foto_url": incidente.foto_opcional,
        "reportado_por": (
            f"{incidente.operario.nombre} {incidente.operario.apellido}".strip()
            if incidente.operario is not None
            else "Sin datos del reportante"
        ),
        "activo": incidente.activo,
        "tipo_id": incidente.tipo_id,
        "tipo": incidente.tipo,
        "dias_abierto": dias_abierto,
        "nivel_demora": "demorado"
        if estado_enum == EstadoIncidente.ABIERTO and dias_abierto >= DIAS_UMBRAL_INCIDENTE_DEMORADO
        else "normal",
    }


def crear_incidente(db: Session, incidente: schemas.IncidenteCreate, persona: Persona) -> Incidente:
    datos = incidente.model_dump()
    datos["operario_id"] = persona.id
    datos["fecha_abierto"] = datetime.now()
    nuevo_incidente = Incidente(**datos)
    db.add(nuevo_incidente)
    db.flush()  # para obtener el id del incidente antes de registrar el evento de historial

    historial_services.registrar_evento_historial(
        db,
        incidente_id=nuevo_incidente.id,
        tipo_evento=TipoEvento.CREADO,
        usuario_id=persona.id,
    )

    db.commit()
    db.refresh(nuevo_incidente)
    return nuevo_incidente


def reabrir_incidente(db: Session, incidente_id: int, motivo: str, persona) -> Incidente:
    db_incidente = leer_incidente(db, incidente_id)
    db_incidente.estado = EstadoIncidente.ABIERTO

    # El listado principal (listar_incidentes) no mira esta columna: considera
    # cerrado a un incidente con una AccionCorrectiva activa (ver
    # _incidente_a_respuesta). Hay que desactivarlas para que también se vea
    # reabierto ahí, no solo en los endpoints CRUD viejos que sí filtran por
    # Incidente.estado.
    for accion_correctiva in db_incidente.acciones_correctivas:
        if accion_correctiva.activo:
            accion_correctiva.activo = False

    historial_services.registrar_evento_historial(
        db,
        incidente_id=db_incidente.id,
        tipo_evento=TipoEvento.REABIERTO,
        usuario_id=persona.id,
        descripcion=motivo,
    )

    db.commit()
    db.refresh(db_incidente)
    return db_incidente


def leer_incidente(db: Session, incidente_id: int) -> Incidente:
    incidente = db.scalar(
        select(Incidente)
        .where(Incidente.id == incidente_id)
        .options(joinedload(Incidente.tipo), joinedload(Incidente.operario), joinedload(Incidente.sector))
    )
    if incidente is None:
        raise exceptions.IncidenteNoEncontrado()
    return incidente


def modificar_incidente(db: Session, incidente_id: int, incidente: schemas.IncidenteUpdate) -> Incidente:
    db_incidente = leer_incidente(db, incidente_id)
    db_incidente.nombre = incidente.nombre
    db_incidente.descripcion = incidente.descripcion
    db_incidente.foto_opcional = incidente.foto_opcional
    db.commit()
    db.refresh(db_incidente)
    return db_incidente


def cambiar_estado_incidente(db: Session, incidente_id: int) -> Incidente:
    db_incidente = leer_incidente(db, incidente_id)
    db_incidente.activo = not db_incidente.activo
    db.commit()
    db.refresh(db_incidente)
    return db_incidente


def listar_incidentes(
    db: Session,
    estado: str | None = None,
    orden: Literal["asc", "desc"] = "desc",
) -> list[dict]:
    accion_registrada = select(AccionCorrectiva.id).where(
        AccionCorrectiva.incidente_id == Incidente.id,
        AccionCorrectiva.activo.is_(True),
    ).exists()
    consulta = (
        select(Incidente)
        .options(
            selectinload(Incidente.tipo),
            selectinload(Incidente.operario),
            selectinload(Incidente.sector),
            selectinload(Incidente.acciones_correctivas),
        )
    )
    if estado in ("abierto", EstadoIncidente.ABIERTO.value):
        consulta = consulta.where(~accion_registrada)
    elif estado in ("cerrado", EstadoIncidente.CERRADO.value):
        consulta = consulta.where(accion_registrada)
    fecha = Incidente.fecha_abierto.asc() if orden == "asc" else Incidente.fecha_abierto.desc()
    incidentes = db.scalars(consulta.order_by(fecha, Incidente.id.asc())).all()
    return [_incidente_a_respuesta(incidente) for incidente in incidentes]


def _listar_incidentes_crud(db: Session, estado: EstadoIncidente | None = None) -> list[Incidente]:
    consulta = select(Incidente).options(
        joinedload(Incidente.tipo),
        joinedload(Incidente.operario),
        joinedload(Incidente.sector),
    )
    if estado is not None:
        consulta = consulta.where(Incidente.estado == estado)
    return db.scalars(consulta).all()


def listar_incidentes_abiertos(db: Session) -> list[Incidente]:
    return _listar_incidentes_crud(db, EstadoIncidente.ABIERTO)


def listar_incidentes_cerrados(db: Session) -> list[Incidente]:
    return _listar_incidentes_crud(db, EstadoIncidente.CERRADO)


def contar_incidentes_abiertos_por_tipo(db: Session) -> list[IncidentesAbiertosPorTipo]:
    accion_registrada = select(AccionCorrectiva.id).where(
        AccionCorrectiva.incidente_id == Incidente.id,
        AccionCorrectiva.activo.is_(True),
    ).exists()
    filas = db.execute(
        select(
            TipoIncidente.id.label("tipo_id"),
            TipoIncidente.nombre.label("tipo"),
            func.count(Incidente.id).label("cantidad"),
        )
        .join(Incidente, Incidente.tipo_id == TipoIncidente.id)
        .where(Incidente.activo.is_(True), ~accion_registrada)
        .group_by(TipoIncidente.id, TipoIncidente.nombre)
        .order_by(TipoIncidente.nombre)
    ).all()
    return [IncidentesAbiertosPorTipo.model_validate(fila._mapping) for fila in filas]
