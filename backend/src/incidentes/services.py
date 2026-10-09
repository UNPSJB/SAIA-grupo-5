from datetime import date, datetime
from typing import Literal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from src.incidentes.constants import DIAS_UMBRAL_INCIDENTE_DEMORADO, EstadoIncidente
from src.incidentes.models import AccionCorrectiva, Incidente, TipoIncidente
from src.incidentes.schemas import IncidentesAbiertosPorTipo


def _dias_abierto(incidente: Incidente, estado: str, hoy: date | None = None) -> int:
    fecha_fin = incidente.fecha_cierre.date() if estado == EstadoIncidente.CERRADO.value and incidente.fecha_cierre else (hoy or date.today())
    return max(0, (fecha_fin - incidente.fecha_abierto.date()).days)


def _incidente_a_respuesta(incidente: Incidente, hoy: date | None = None) -> dict:
    tiene_accion_correctiva = any(accion.activo for accion in incidente.acciones_correctivas)
    estado = (
        EstadoIncidente.CERRADO.value
        if tiene_accion_correctiva
        else EstadoIncidente.ABIERTO.value
    )
    dias_abierto = _dias_abierto(incidente, estado, hoy)
    return {
        "id": incidente.id,
        "nombre": incidente.nombre,
        "descripcion": incidente.descripcion,
        "estado": estado,
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
        if estado == EstadoIncidente.ABIERTO.value and dias_abierto >= DIAS_UMBRAL_INCIDENTE_DEMORADO
        else "normal",
    }


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
            selectinload(Incidente.acciones_correctivas),
        )
        .where(Incidente.activo.is_(True))
    )
    if estado == EstadoIncidente.ABIERTO.value:
        consulta = consulta.where(~accion_registrada)
    elif estado == EstadoIncidente.CERRADO.value:
        consulta = consulta.where(accion_registrada)
    fecha = Incidente.fecha_abierto.asc() if orden == "asc" else Incidente.fecha_abierto.desc()
    incidentes = db.scalars(consulta.order_by(fecha, Incidente.id.asc())).all()
    return [_incidente_a_respuesta(incidente) for incidente in incidentes]


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
        .where(
            Incidente.activo.is_(True),
            ~accion_registrada,
        )
        .group_by(TipoIncidente.id, TipoIncidente.nombre)
        .order_by(TipoIncidente.nombre)
    ).all()
    return [IncidentesAbiertosPorTipo.model_validate(fila._mapping) for fila in filas]
