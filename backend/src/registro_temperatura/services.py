from datetime import date
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload
from src.equipos import exceptions as equipo_exceptions
from src.equipos import services as equipo_services
from src.equipos.models import Equipo
from src.insumos_lote.models import InsumoLote
from src.lote_produccion.models import LoteProduccion
from src.notificaciones.services import generar_notificacion_temperatura_fuera_rango
from src.personal.models import Persona
from src.registro_temperatura import exceptions, schemas
from src.registro_temperatura.models import RegistroTemperatura
from src.sector import exceptions as sector_exceptions
from src.sector.models import Sector


def registrar_temperatura(db: Session, datos: schemas.RegistroTemperaturaCreate, usuario: Persona) -> schemas.RegistroTemperaturaResultado:
    equipo = db.scalar(select(Equipo).where(Equipo.id == datos.equipo_id).options(joinedload(Equipo.sector)))
    
    if equipo is None:
        raise equipo_exceptions.EquipoNoEncontrado()
    if not equipo.estado:
        raise equipo_exceptions.EquipoDadoDeBaja()
    if not equipo.controla_temperatura:
        raise exceptions.EquipoNoControlaTemperatura()
    if (equipo.temperatura_minima is None or equipo.temperatura_maxima is None or equipo.temperatura_minima >= equipo.temperatura_maxima):
        raise exceptions.RangoTemperaturaInvalido()

    fuera_de_rango = (datos.temperatura_registrada < equipo.temperatura_minima or datos.temperatura_registrada > equipo.temperatura_maxima)
    accion_limpia = datos.accion_tomada.strip() if datos.accion_tomada else None

    if fuera_de_rango and not accion_limpia:
        raise exceptions.AccionTomadaRequerida()

    nuevo_registro = RegistroTemperatura(
        equipo_id=equipo.id,
        operario_id=usuario.id,
        temperatura_registrada=datos.temperatura_registrada,
        fuera_de_rango=fuera_de_rango,
        accion_tomada=accion_limpia if fuera_de_rango else None,
    )
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)

    almacenamiento_afectado = None
    if fuera_de_rango:
        generar_notificacion_temperatura_fuera_rango(db, nuevo_registro, equipo)
        almacenamiento_afectado = equipo_services.obtener_almacenamiento_equipo(db, equipo.id)

        if datos.reubicar_mercaderia and (datos.destino_equipo_id is not None or datos.destino_sector_id is not None):
            if datos.destino_equipo_id is not None:
                destino_equipo = db.get(Equipo, datos.destino_equipo_id)
                if not destino_equipo or not destino_equipo.estado:
                    raise equipo_exceptions.EquipoNoEncontrado()
                nuevo_equipo_id = destino_equipo.id
                nuevo_sector_id = destino_equipo.sector_id
            else:
                destino_sector = db.get(Sector, datos.destino_sector_id)
                if not destino_sector or not destino_sector.activo:
                    raise sector_exceptions.SectorNoEncontrado()
                nuevo_equipo_id = None
                nuevo_sector_id = destino_sector.id

            insumos_en_equipo = db.scalars(
                select(InsumoLote).where(
                    InsumoLote.equipo_id == equipo.id,
                    InsumoLote.activo == True,
                    InsumoLote.cantidad_restante > 0)).all()
            
            ids_insumos = set(datos.insumos_ids_a_mover) if datos.insumos_ids_a_mover is not None else None
            for item in insumos_en_equipo:
                if ids_insumos is None or item.id in ids_insumos:
                    item.equipo_id = nuevo_equipo_id
                    item.sector_id = nuevo_sector_id

            lotes_en_equipo = db.scalars(
                select(LoteProduccion).where(
                    LoteProduccion.equipo_id == equipo.id,
                    LoteProduccion.activo == True,
                    LoteProduccion.cantidad_disponible > 0)).all()
            
            ids_lotes = set(datos.lotes_ids_a_mover) if datos.lotes_ids_a_mover is not None else None
            for lote in lotes_en_equipo:
                if ids_lotes is None or lote.id in ids_lotes:
                    lote.equipo_id = nuevo_equipo_id
                    lote.sector_id = nuevo_sector_id

            db.commit()

    registro_completo = db.scalar(
        select(RegistroTemperatura).where(RegistroTemperatura.id == nuevo_registro.id)
            .options(joinedload(RegistroTemperatura.equipo).joinedload(Equipo.sector),
            joinedload(RegistroTemperatura.operario)))
    
    resultado = schemas.RegistroTemperaturaResultado.model_validate(registro_completo)
    resultado.almacenamiento_afectado = almacenamiento_afectado
    return resultado


def listar_registros_por_equipo(db: Session, equipo_id: int, solo_alertas: bool = False, fecha_desde: date | None = None, fecha_hasta: date | None = None) -> list[RegistroTemperatura]:
    equipo_services.leer_equipo(db, equipo_id)
    consulta = (select(RegistroTemperatura).where(RegistroTemperatura.equipo_id == equipo_id)
                .options(joinedload(RegistroTemperatura.equipo).joinedload(Equipo.sector),
                joinedload(RegistroTemperatura.operario)))
    
    if solo_alertas:
        consulta = consulta.where(RegistroTemperatura.fuera_de_rango == True)
    if fecha_desde is not None:
        consulta = consulta.where(func.date(RegistroTemperatura.fecha_hora_registro) >= fecha_desde)
    if fecha_hasta is not None:
        consulta = consulta.where(func.date(RegistroTemperatura.fecha_hora_registro) <= fecha_hasta)

    return db.scalars(consulta.order_by(RegistroTemperatura.fecha_hora_registro.desc(), RegistroTemperatura.id.desc())).all()


def listar_equipos_pendientes_hoy(db: Session) -> list[Equipo]:
    hoy = date.today()
    ids_registrados_hoy = set(
        db.scalars(
            select(RegistroTemperatura.equipo_id).where(
                func.date(RegistroTemperatura.fecha_hora_registro) == hoy)).all())
    
    equipos_frio = db.scalars(
        select(Equipo).where(Equipo.estado == True, Equipo.controla_temperatura == True)
                    .options(joinedload(Equipo.sector)).order_by(Equipo.nombre.asc())).all()
    
    return [equipo for equipo in equipos_frio if equipo.id not in ids_registrados_hoy]
