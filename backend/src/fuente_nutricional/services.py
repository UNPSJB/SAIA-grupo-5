import logging
import csv
import io
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import List
from sqlalchemy import select, update
from sqlalchemy.orm import Session, joinedload
from src.fuente_nutricional.models import FuenteNutricional, AlimentoReferencia
from src.fuente_nutricional import exceptions, schemas
from src.personal.models import Persona

logger = logging.getLogger(__name__)

def listar_fuentes_nutricionales(db: Session) -> List[schemas.FuenteNutricional]:
    return db.scalars(select(FuenteNutricional)).all()

def leer_fuente_nutricional(db: Session, fuente_nutricional_id: int) -> schemas.FuenteNutricional:
    db_fuente_nutricional = db.scalars(select(FuenteNutricional).where(FuenteNutricional.id == fuente_nutricional_id)).first()

    if db_fuente_nutricional is None:
        raise exceptions.FuenteNutricionalNoEncontrada()
    return db_fuente_nutricional

def crear_fuente_nutricional(db: Session, fuente_nutricional: schemas.FuenteNutricionalCreate) -> schemas.FuenteNutricional:
    fuente_nutricional_existente = db.scalars(select(FuenteNutricional).where(FuenteNutricional.nombre == fuente_nutricional.nombre)).first()

    if fuente_nutricional_existente:
        raise exceptions.FuenteNutricionalDuplicada()

    _fuente_nutricional = FuenteNutricional(**fuente_nutricional.model_dump())
    db.add(_fuente_nutricional)
    db.commit()
    db.refresh(_fuente_nutricional)
    return _fuente_nutricional

def modificar_fuente_nutricional(db: Session, fuente_nutricional_id: int, fuente_nutricional: schemas.FuenteNutricionalUpdate) -> schemas.FuenteNutricional:
    fuente_nutricional_existente = db.scalars(select(FuenteNutricional).where(FuenteNutricional.nombre == fuente_nutricional.nombre,
                                            FuenteNutricional.id != fuente_nutricional_id)).first()
    if fuente_nutricional_existente:
        raise exceptions.FuenteNutricionalDuplicada()

    db_fuente_nutricional = leer_fuente_nutricional(db, fuente_nutricional_id)

    for key, value in fuente_nutricional.model_dump().items():
        setattr(db_fuente_nutricional, key, value)

    db.commit()
    db.refresh(db_fuente_nutricional)
    return db_fuente_nutricional

def cambiar_estado_fuente_nutricional(db: Session, fuente_nutricional_id: int) -> schemas.FuenteNutricional:
    db_fuente_nutricional = leer_fuente_nutricional(db, fuente_nutricional_id)

    db_fuente_nutricional.activo = not db_fuente_nutricional.activo
    db.commit()
    db.refresh(db_fuente_nutricional)
    return db_fuente_nutricional

def verificar_fuente_nutricional(db: Session, fuente_nutricional_id: int, persona: Persona) -> schemas.FuenteNutricional:
    db_fuente_nutricional = leer_fuente_nutricional(db, fuente_nutricional_id)

    db_fuente_nutricional.licencia_verificada = not db_fuente_nutricional.licencia_verificada
    db_fuente_nutricional.verificada_por_id = persona.id
    db_fuente_nutricional.fecha_verificacion = datetime.now()
  
    db.commit()
    db.refresh(db_fuente_nutricional)
    return db_fuente_nutricional

def _a_decimal_o_none(valor:str | None) -> Decimal | None:
    if valor is None:
        return None
    limpio = valor.strip().replace(",", ".")
    if limpio == "" or limpio.lower() in ("nan", "null", "none", "-"):
        return None
    try:
        return Decimal(limpio)
    except InvalidOperation:
        return None

def importar_csv_sara(db: Session, fuente_nutricional_id: int, contenido_csv: bytes) -> dict:
    fuente = leer_fuente_nutricional(db, fuente_nutricional_id)
    if not fuente.activo or not fuente.licencia_verificada:
        raise exceptions.FuenteNoHabilitada()
    texto = contenido_csv.decode("utf-8-sig")
    lector = csv.DictReader(io.StringIO(texto))

    existentes = {
        a.codigo_externo: a
        for a in db.scalars(select(AlimentoReferencia).where(AlimentoReferencia.fuente_nutricional_id == fuente_nutricional_id)).all()
        if a.codigo_externo
    }
    creados = 0
    actualizados = 0

    for fila in lector:
        codigo = (fila.get("Codigo") or "").strip()
        nombre = (fila.get("Alimento") or "").strip()
        if not nombre:
            continue

        datos = { 
            "nombre": nombre,
            "valor_energetico": _a_decimal_o_none(fila.get("E")),
            "carbohidratos": _a_decimal_o_none(fila.get("HCdisp") or fila.get("HCtotal")),
            "azucares_totales": _a_decimal_o_none(fila.get("AzucaresTotales")),
            "azucares_anadidos": _a_decimal_o_none(fila.get("AzucaresAnadidos")),
            "proteinas": _a_decimal_o_none(fila.get("Prot")),
            "grasas_totales": _a_decimal_o_none(fila.get("Lip")),
            "grasas_saturadas": _a_decimal_o_none(fila.get("AGSat")),
            "grasas_trans": _a_decimal_o_none(fila.get("AGTrans")),
            "fibra_alimentaria": _a_decimal_o_none(fila.get("Fibra")),
            "sodio": _a_decimal_o_none(fila.get("Na")),
        }
        if codigo and codigo in existentes:
            alim = existentes[codigo]
            for k, v in datos.items():
                setattr(alim,k,v)
            actualizados += 1
        else:
            db.add(AlimentoReferencia(
                fuente_nutricional_id=fuente_nutricional_id, 
                codigo_externo=codigo or None,
                **datos))
            creados += 1

    db.commit()
    return {"creados": creados, "actualizados": actualizados}

def leer_alimentos_referencia(db: Session, fuente_nutricional_id: int | None = None, busqueda: str | None = None) -> list[schemas.AlimentoReferencia]:
    stmt = select(AlimentoReferencia)
    if fuente_nutricional_id is not None:
        stmt = stmt.where(AlimentoReferencia.fuente_nutricional_id == fuente_nutricional_id)
    if busqueda:
        stmt = stmt.where(AlimentoReferencia.nombre.ilike(f"%{busqueda.strip()}%"))
    return list(db.scalars(stmt.limit(50)).all())
