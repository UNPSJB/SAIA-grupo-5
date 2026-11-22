import logging
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from src.alergenos.models import Alergeno, InsumoAlergeno
from src.alergenos.services import leer_alergeno
from src.declaracion_alergenos import exceptions, schemas
from src.declaracion_alergenos.constants import EstadoDeclaracion
from src.declaracion_alergenos.models import DeclaracionAlergenosReceta
from src.insumos.models import Insumo
from src.personal.models import Persona
from src.receta.exceptions import RecetaNoEncontrada
from src.receta.models import InsumoReceta, Receta
from src.receta.services import obtener_receta_de_producto

logger = logging.getLogger(__name__)

def _unir_en_mayusculas(items: list[str]) -> str:
    mayus = [item.upper() for item in items]
    if len(mayus) == 1:
        return mayus[0]
    return f"{', '.join(mayus[:-1])} Y {mayus[-1]}"

def _formatear_texto_alergenos(prefijo: str, lista: list[dict]) -> str | None:
    if not lista:
        return None

    directos = [item["nombre"] for item in lista if not item["es_derivado"]]
    derivados = [item["nombre"] for item in lista if item["es_derivado"]]

    partes: list[str] = []
    if directos:
        partes.append(_unir_en_mayusculas(directos))
    if derivados:
        etiqueta = "DERIVADO DE" if len(derivados) == 1 else "DERIVADOS DE"
        partes.append(f"{etiqueta} {_unir_en_mayusculas(derivados)}")

    return f"{prefijo} {' Y '.join(partes)}."

def _cargar_receta_con_alergenos(db: Session, receta_id: int) -> Receta:
    receta = db.scalar(select(Receta).options(
            joinedload(Receta.insumos).joinedload(InsumoReceta.insumo)
            .joinedload(Insumo.alergenos).joinedload(InsumoAlergeno.alergeno)
        ).where(Receta.id == receta_id)
    )
    if receta is None:
        raise RecetaNoEncontrada()
    return receta

def _calcular_desde_insumos(receta: Receta) -> tuple[list[dict], str | None, bool, str]:
    detectados: dict[int, dict] = {}
    tiene_gluten = False

    for renglon in receta.insumos:
        insumo = renglon.insumo
        if insumo.contiene_gluten:
            tiene_gluten = True

        for marca in insumo.alergenos:
            alergeno = marca.alergeno
            if alergeno.es_tacc:
                tiene_gluten = True

            if alergeno.id in detectados:
                detectados[alergeno.id]["es_derivado"] = (detectados[alergeno.id]["es_derivado"] and marca.es_derivado)
            else:
                detectados[alergeno.id] = { "alergeno_id": alergeno.id, "nombre": alergeno.nombre, "es_derivado": marca.es_derivado, "es_tacc": alergeno.es_tacc }

    lista_detectados = list(detectados.values())
    texto_alergenos = _formatear_texto_alergenos("CONTIENE", lista_detectados)

    if tiene_gluten:
        texto_gluten = "CONTIENE GLUTEN (TACC)"
    else:
        texto_gluten = "LIBRE DE GLUTEN / SIN TACC (sugerido según ingredientes)"

    return lista_detectados, texto_alergenos, tiene_gluten, texto_gluten

def crear_propuesta_receta(db: Session, receta_id: int) -> DeclaracionAlergenosReceta:
    receta = _cargar_receta_con_alergenos(db, receta_id)
    if not receta.vigente:
        raise exceptions.RecetaNoVigente()

    detectados, texto_alergenos, tiene_gluten, texto_gluten = _calcular_desde_insumos(receta)

    declaracion = db.scalar(select(DeclaracionAlergenosReceta).where(DeclaracionAlergenosReceta.receta_id == receta_id))

    if declaracion is None:
        declaracion = DeclaracionAlergenosReceta(receta_id=receta_id)
        db.add(declaracion)

    declaracion.alergenos_detectados = detectados
    declaracion.texto_alergenos = texto_alergenos
    declaracion.contiene_gluten = tiene_gluten
    declaracion.texto_gluten = texto_gluten
    declaracion.estado = EstadoDeclaracion.SUGERIDA_SISTEMA.value
    declaracion.confirmada_por_id = None
    declaracion.fecha_confirmacion = None

    db.commit()
    return leer_declaracion_receta(db, receta_id)

def leer_declaracion_receta(db: Session, receta_id: int) -> DeclaracionAlergenosReceta:
    declaracion = db.scalar(select(DeclaracionAlergenosReceta)
        .options(joinedload(DeclaracionAlergenosReceta.confirmada_por))
        .where(DeclaracionAlergenosReceta.receta_id == receta_id)
    )
    if declaracion is None:
        raise exceptions.DeclaracionNoEncontrada()
    return declaracion

def leer_declaracion_producto(db: Session, producto_id: int) -> DeclaracionAlergenosReceta:
    receta_vigente = obtener_receta_de_producto(db, producto_id)
    declaracion = db.scalar(select(DeclaracionAlergenosReceta)
        .options(joinedload(DeclaracionAlergenosReceta.confirmada_por))
        .where(DeclaracionAlergenosReceta.receta_id == receta_vigente.id)
    )
    if declaracion is None:
        return crear_propuesta_receta(db, receta_vigente.id)
    return declaracion

def modificar_declaracion_receta(db: Session, receta_id: int, datos: schemas.DeclaracionAlergenosUpdate) -> DeclaracionAlergenosReceta:
    receta = _cargar_receta_con_alergenos(db, receta_id)
    if not receta.vigente:
        raise exceptions.RecetaNoVigente()

    declaracion = db.scalar(select(DeclaracionAlergenosReceta).where(DeclaracionAlergenosReceta.receta_id == receta_id))

    if declaracion is None:
        declaracion = crear_propuesta_receta(db, receta_id)

    cruzada_unicos: dict[int, dict] = {}
    tiene_tacc_cruzada = False
    for item in datos.contaminacion_cruzada:
        db_alergeno: Alergeno = leer_alergeno(db, item.alergeno_id)
        if db_alergeno.es_tacc:
            tiene_tacc_cruzada = True
        cruzada_unicos[item.alergeno_id] = {"alergeno_id": db_alergeno.id, "nombre": db_alergeno.nombre, "es_derivado": item.es_derivado}

    lista_cruzada = list(cruzada_unicos.values())
    declaracion.contaminacion_cruzada = lista_cruzada
    declaracion.texto_contaminacion_cruzada = _formatear_texto_alergenos("PUEDE CONTENER", lista_cruzada)

    if not declaracion.contiene_gluten:
        if tiene_tacc_cruzada:
            declaracion.texto_gluten = "CONTIENE GLUTEN / RIESGO DE CONTAMINACIÓN CRUZADA CON TACC"
        else:
            declaracion.texto_gluten = "LIBRE DE GLUTEN / SIN TACC (sugerido según ingredientes)"

    declaracion.condiciones_conservacion = (
        datos.condiciones_conservacion.strip()
        if datos.condiciones_conservacion and datos.condiciones_conservacion.strip()
        else None
    )
    
    declaracion.estado = EstadoDeclaracion.SUGERIDA_SISTEMA.value
    declaracion.confirmada_por_id = None
    declaracion.fecha_confirmacion = None

    db.commit()
    return leer_declaracion_receta(db, receta_id)


def confirmar_declaracion_receta(db: Session, receta_id: int, persona: Persona) -> DeclaracionAlergenosReceta:
    receta = _cargar_receta_con_alergenos(db, receta_id)
    if not receta.vigente:
        raise exceptions.RecetaNoVigente()

    declaracion = leer_declaracion_receta(db, receta_id)
    declaracion.estado = EstadoDeclaracion.CONFIRMADA.value
    declaracion.confirmada_por_id = persona.id
    declaracion.fecha_confirmacion = datetime.now()

    db.commit()
    return leer_declaracion_receta(db, receta_id)