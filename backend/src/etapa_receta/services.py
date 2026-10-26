import logging
from sqlalchemy.orm import Session
from src.etapa_receta.models import EtapaReceta
from src.etapa_receta import schemas, exceptions
from src.paso_etapa.models import PasoEtapa
from src.paso_etapa.schemas import PasoEtapaAnidadoCreate
from src.receta.models import Receta
from src.receta.exceptions import RecetaNoEncontrada
from src.receta import orden

logger = logging.getLogger(__name__)


def construir_etapa(nombre: str, pasos: list[PasoEtapaAnidadoCreate]) -> EtapaReceta:
    # Arma la etapa con sus pasos numerados según su posición en la lista
    db_etapa = EtapaReceta(nombre=nombre)
    for paso in pasos:
        orden.insertar(db_etapa.pasos, PasoEtapa(descripcion=paso.descripcion))
    return db_etapa


# operaciones CRUD para EtapaReceta

def crear_etapa(db: Session, etapa: schemas.EtapaRecetaCreate) -> schemas.EtapaReceta:
    db_receta = db.get(Receta, etapa.receta_id)
    if db_receta is None:
        raise RecetaNoEncontrada()

    db_etapa = construir_etapa(etapa.nombre, etapa.pasos)
    orden.insertar(db_receta.etapas, db_etapa, etapa.orden)
    db.commit()
    db.refresh(db_etapa)
    return db_etapa

def leer_etapa(db: Session, etapa_id: int) -> schemas.EtapaReceta:
    db_etapa = db.get(EtapaReceta, etapa_id)
    if db_etapa is None:
        raise exceptions.EtapaNoEncontrada()
    return db_etapa

def actualizar_etapa(db: Session, etapa_id: int, etapa: schemas.EtapaRecetaUpdate) -> schemas.EtapaReceta:
    db_etapa = leer_etapa(db, etapa_id)
    db_etapa.nombre = etapa.nombre
    db.commit()
    db.refresh(db_etapa)
    return db_etapa

# Mueve la etapa a la posición indicada y recalcula el orden del resto de la receta
def reordenar_etapas(db: Session, etapa_id: int, nuevo_orden: int) -> list[schemas.EtapaReceta]:
    db_etapa = leer_etapa(db, etapa_id)
    db_receta = db_etapa.receta
    orden.mover(db_receta.etapas, db_etapa, nuevo_orden)
    db.commit()
    return db_receta.etapas

def eliminar_etapa(db: Session, etapa_id: int) -> schemas.EtapaReceta:
    db_etapa = leer_etapa(db, etapa_id)
    db_receta = db_etapa.receta
    if len(db_receta.etapas) == 1:
        raise exceptions.EtapaUnica()

    # Cargamos los pasos antes de borrar para poder devolverlos en la respuesta
    db_etapa.pasos
    db_receta.etapas.remove(db_etapa)
    orden.renumerar(db_receta.etapas)
    db.commit()
    return db_etapa
