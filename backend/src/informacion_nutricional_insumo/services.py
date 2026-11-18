import logging
from datetime import datetime
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from src.informacion_nutricional_insumo.models import InformacionNutricionalInsumo
from src.informacion_nutricional_insumo import constants, exceptions, schemas
from src.personal.models import Persona
from src.historial_nutricional_insumo import services as historial_services

logger = logging.getLogger(__name__)

def _validar_reglas_nutricionales(info_nutricional: schemas.InfoNutricionalBase, es_aditivo: bool) -> None:
    if not es_aditivo:
        faltantes = [c for c in constants.DATOS_NUTRICIONALES if getattr(info_nutricional, c) is None]
        if faltantes: raise exceptions.DatosObligatoriosFaltantes(faltantes)

    if info_nutricional.azucares_anadidos is not None and info_nutricional.azucares_totales is not None:
        if info_nutricional.azucares_anadidos > info_nutricional.azucares_totales:
            raise exceptions.AzucarAnadidoIncorrecta()

    if info_nutricional.azucares_totales is not None and info_nutricional.carbohidratos is not None:
        if info_nutricional.azucares_totales > info_nutricional.carbohidratos:
            raise exceptions.AzucarTotalIncorrecta()
            
    if info_nutricional.grasas_totales is not None:
        saturadas = info_nutricional.grasas_saturadas or Decimal("0")
        trans = info_nutricional.grasas_trans or Decimal("0")

        if (saturadas + trans) > info_nutricional.grasas_totales:
            raise exceptions.GrasaTotalIncorrecta()

def leer_info_nutricional(db: Session, info_nutricional_id: int) -> schemas.InfoNutricional:
    db_info_nutricional = db.scalars(select(InformacionNutricionalInsumo).where(InformacionNutricionalInsumo.id == info_nutricional_id)).first()

    if db_info_nutricional is None:
        raise exceptions.InfoNutricionalNoEncontrada()
    return db_info_nutricional

def cargar_info_nutricional(db: Session, info_nutricional: schemas.InfoNutricionalCreate, persona: Persona) -> schemas.InfoNutricional:
    if (info_nutricional.insumo_id is None) == (info_nutricional.aditivo_id is None):
            raise exceptions.AsociacionIncorrecta()

    if info_nutricional.insumo_id is not None: 
        info_existente = db.scalars(select(InformacionNutricionalInsumo).where(InformacionNutricionalInsumo.insumo_id == info_nutricional.insumo_id)).first()
    else:
        info_existente = db.scalars(select(InformacionNutricionalInsumo).where(InformacionNutricionalInsumo.aditivo_id == info_nutricional.aditivo_id)).first()
        
    if info_existente:
        raise exceptions.InfoNutricionalDuplicada()

    es_aditivo = info_nutricional.aditivo_id is not None
    _validar_reglas_nutricionales(info_nutricional, es_aditivo = es_aditivo)

    _nueva_info = InformacionNutricionalInsumo(
        **info_nutricional.model_dump(exclude={"modificado_respecto_fuente"}),
        cargada_por_id = persona.id,
        fecha_carga = datetime.now(),
        modificado = info_nutricional.modificado_respecto_fuente,
        modificada_por_id = persona.id if info_nutricional.modificado_respecto_fuente else None,
        fecha_modificacion = datetime.now() if info_nutricional.modificado_respecto_fuente else None,
    )
   
    db.add(_nueva_info)
    db.commit()
    db.refresh(_nueva_info)
    return _nueva_info

def modificar_info_nutricional(db: Session, info_nutricional_id: int, info_nutricional: schemas.InfoNutricionalUpdate, persona: Persona) -> schemas.InfoNutricional:
    db_info_nutricional = leer_info_nutricional(db, info_nutricional_id)

    es_aditivo = db_info_nutricional.aditivo_id is not None
    _validar_reglas_nutricionales(info_nutricional, es_aditivo = es_aditivo)
    hubo_cambios = False

    for dato in constants.DATOS_NUTRICIONALES:
        valor_actual = getattr(db_info_nutricional, dato)
        valor_nuevo = info_nutricional.model_dump()[dato]
        if valor_actual != valor_nuevo:
            hubo_cambios = True
            historial_services.registrar_cambio(
                db = db, 
                informacion_nutricional_id=db_info_nutricional.id,
                dato_modificado = dato,
                valor_anterior = valor_actual,
                valor_nuevo = valor_nuevo,
                persona_id = persona.id,
                fecha = datetime.now()
                )
    
    for key, value in info_nutricional.model_dump().items():
        setattr(db_info_nutricional, key, value)

    if hubo_cambios:
        db_info_nutricional.modificado = True
        db_info_nutricional.modificada_por_id = persona.id
        db_info_nutricional.fecha_modificacion = datetime.now()

    db.commit()
    db.refresh(db_info_nutricional)
    return db_info_nutricional

def leer_info_nutricional_por_insumo(db: Session, insumo_id: int) -> schemas.InfoNutricional:
    db_info_nutricional = db.scalars(select(InformacionNutricionalInsumo)
            .options(
                joinedload(InformacionNutricionalInsumo.fuente_nutricional),
                joinedload(InformacionNutricionalInsumo.cargada_por),
                joinedload(InformacionNutricionalInsumo.modificada_por),)
            .where(InformacionNutricionalInsumo.insumo_id == insumo_id)).first()

    if db_info_nutricional is None:
        raise exceptions.InfoNutricionalNoEncontrada()
    return db_info_nutricional

