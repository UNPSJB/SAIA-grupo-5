import logging
from typing import List
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload
from src.alergenos.models import Alergeno, InsumoAlergeno
from src.alergenos import schemas, exceptions
from src.insumos.models import Insumo
from src.insumos.exceptions import InsumoNoEncontrado

logger = logging.getLogger(__name__)

def crear_alergeno(db: Session, alergeno: schemas.AlergenoCreate) -> schemas.Alergeno:
    alergeno_existente = db.scalars(select(Alergeno).where(Alergeno.nombre == alergeno.nombre)).first()

    if alergeno_existente:
        raise exceptions.AlergenoDuplicado()

    _alergeno = Alergeno(**alergeno.model_dump())
    db.add(_alergeno)
    db.commit()
    db.refresh(_alergeno)
    return _alergeno

def listar_alergenos(db: Session) -> List[schemas.Alergeno]:
    return db.scalars(select(Alergeno)).all()

def leer_alergeno(db: Session, alergeno_id: int) -> schemas.Alergeno:
    db_alergeno = db.scalar(select(Alergeno).where(Alergeno.id == alergeno_id))
    if db_alergeno is None:
        raise exceptions.AlergenoNoEncontrado()
    return db_alergeno

def modificar_alergeno(db: Session, alergeno_id: int, alergeno: schemas.AlergenoUpdate) -> schemas.Alergeno:  

    alergeno_duplicado = db.scalars(select(Alergeno).where(Alergeno.nombre == alergeno.nombre, Alergeno.id != alergeno_id)).first()
    
    if alergeno_duplicado:
        raise exceptions.AlergenoDuplicado()

    alergeno_actualizado = alergeno.model_dump(exclude_unset=True)
    for key, value in alergeno_actualizado.items():
        setattr(db_alergeno, key, value)
    
    db.commit()
    db.refresh(db_alergeno)
    return db_alergeno

def cambiar_estado_alergeno(db: Session, alergeno_id: int) -> schemas.Alergeno:
    db_alergeno = leer_alergeno(db, alergeno_id)
    
    if db_alergeno.activo:
        insumo_asociado = db.scalars(select(Insumo)
                            .join(InsumoAlergeno, InsumoAlergeno.insumo_id == Insumo.id)
                            .where(InsumoAlergeno.alergeno_id == db_alergeno.id,
                            Insumo.activo == True)).first()
        if insumo_asociado:
            raise exceptions.AlergenoUtilizado()
    
    db_alergeno.activo = not db_alergeno.activo
    db.commit()
    db.refresh(db_alergeno)
    return db_alergeno

def leer_alergenos_insumo(db: Session, insumo_id: int) -> schemas.InsumoAlergenosResponse:
    db_insumo = db.scalar(select(Insumo)
        .options(joinedload(Insumo.alergenos).joinedload(InsumoAlergeno.alergeno))
        .where(Insumo.id == insumo_id)
    )
    if db_insumo is None:
        raise InsumoNoEncontrado()

    return schemas.InsumoAlergenosResponse(insumo_id=db_insumo.id, contiene_gluten=db_insumo.contiene_gluten, alergenos=db_insumo.alergenos)

def guardar_alergenos_insumo(db: Session, insumo_id: int, datos: schemas.InsumoAlergenosUpdate) -> schemas.InsumoAlergenosResponse:
    db_insumo = db.scalar(select(Insumo).where(Insumo.id == insumo_id))
    if db_insumo is None:
        raise InsumoNoEncontrado()

    alergenos_unicos: dict[int, bool] = {}
    tiene_tacc = False
    for item in datos.alergenos:
        db_alergeno = leer_alergeno(db, item.alergeno_id)
        alergenos_unicos[item.alergeno_id] = item.es_derivado
        if db_alergeno.es_tacc:
            tiene_tacc = True

    db_insumo.contiene_gluten = datos.contiene_gluten or tiene_tacc

    db.execute(delete(InsumoAlergeno).where(InsumoAlergeno.insumo_id == insumo_id))

    for alergeno_id, es_derivado in alergenos_unicos.items():
        db.add(InsumoAlergeno(insumo_id=insumo_id, alergeno_id=alergeno_id, es_derivado=es_derivado))

    db.commit()
    return leer_alergenos_insumo(db, insumo_id)

