# scripts/seed_documentos.py
"""
Pobla la base con Tipos de Documento y al menos 3 Documentos de ejemplo,
cada uno con una VersionDocumento. Para uno de los documentos se marca esa
versión como vigente (igual que haría
version_documento.services.marcar_version_vigente: fecha_desde_vigencia,
aprobador y el HistorialVigencia correspondiente), simulando una versión ya
aprobada; los demás quedan con su versión cargada pero sin aprobar todavía
(vigente=False), que es el estado real en el que nace una versión nueva.

Requiere haber corrido antes:
1. python -m scripts.seed_personal (al menos una persona con administrar=True
   para hacer de aprobador; si no hay, usa cualquier persona activa)

Uso: python -m scripts.seed_documentos
"""
from datetime import date, datetime, timedelta

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.personal.models import Persona
from src.tipo_documento.models import TipoDocumento
from src.documentos.models import Documento
from src.version_documento.models import VersionDocumento
from src.historial_vigencia_documento.models import HistorialVigencia

TIPOS_DOCUMENTOS = [
    ("Manual de POES", "Manuales generales de procedimientos operativos de saneamiento."),
    ("Procedimiento Operativo", "Procedimientos puntuales de limpieza o manipulación."),
    ("Ficha Técnica", "Fichas técnicas de insumos y productos químicos."),
    ("Registro de Capacitación", "Constancias de capacitaciones del personal."),
]

# (nombre, descripcion, tipo, archivo, observacion)
DOCUMENTOS = [
    (
        "Manual General de POES",
        "Manual general de Procedimientos Operativos Estandarizados de Saneamiento de la planta.",
        "Manual de POES",
        "documentos/manual_poes_v2.pdf",
        "Revisión anual del manual general.",
    ),
    (
        "Procedimiento de Limpieza de Equipos de Frío",
        "Procedimiento específico para la limpieza y desinfección de cámaras y freezers.",
        "Procedimiento Operativo",
        "documentos/procedimiento_equipos_frio_v1.pdf",
        None,
    ),
    (
        "Ficha Técnica - Detergente Industrial",
        "Ficha técnica del detergente industrial utilizado en la línea de elaboración.",
        "Ficha Técnica",
        "documentos/ficha_detergente_industrial_v1.pdf",
        None,
    ),
    (
        "Registro de Capacitación en Manipulación de Alimentos",
        "Constancia de la capacitación anual en manipulación segura de alimentos.",
        "Registro de Capacitación",
        "documentos/registro_capacitacion_manipulacion_v1.pdf",
        None,
    ),
]

# Nombre del documento (de la lista de arriba) al que se le marca la
# versión como vigente.
DOCUMENTO_VIGENTE = "Manual General de POES"


def generar_tipos_documentos(db) -> dict[str, TipoDocumento]:
    tipos = {nombre: TipoDocumento(nombre=nombre, descripcion=descripcion) for nombre, descripcion in TIPOS_DOCUMENTOS}
    db.add_all(tipos.values())
    db.flush()  # necesitamos el id de cada tipo antes de crear los documentos
    return tipos


def generar_documentos(db, tipos: dict[str, TipoDocumento]) -> list[tuple[Documento, str, str | None]]:
    pares = []
    for nombre, descripcion, tipo_nombre, archivo, observacion in DOCUMENTOS:
        documento = Documento(
            nombre=nombre,
            descripcion=descripcion,
            tipo_id=tipos[tipo_nombre].id,
        )
        pares.append((documento, archivo, observacion))
    return pares


def generar_versiones(db, pares: list[tuple[Documento, str, str | None]], aprobador: Persona) -> list[VersionDocumento]:
    hoy = date.today()
    versiones = []

    for documento, archivo, observacion in pares:
        es_vigente = documento.nombre == DOCUMENTO_VIGENTE

        version = VersionDocumento(
            version=1,
            documento_id=documento.id,
            archivo=archivo,
            observacion=observacion,
            fecha_subida=hoy - timedelta(days=10 if es_vigente else 2),
        )

        if es_vigente:
            ahora = datetime.now()
            version.vigente = True
            version.fecha_desde_vigencia = ahora
            version.fecha_aprobacion = ahora
            version.aprobador_id = aprobador.id

        versiones.append(version)

    return versiones


def main():
    db = SessionLocal()
    try:
        aprobador = (
            db.query(Persona).filter(Persona.activo == True, Persona.administrar == True).first()
            or db.query(Persona).filter(Persona.activo == True).first()
        )
        if aprobador is None:
            print("No hay personal cargado. Correr antes scripts.seed_personal.")
            return

        tipos = generar_tipos_documentos(db)
        pares = generar_documentos(db, tipos)

        documentos = [documento for documento, _, _ in pares]
        db.add_all(documentos)
        db.flush()  # necesitamos el id de cada documento antes de crear sus versiones

        versiones = generar_versiones(db, pares, aprobador)
        db.add_all(versiones)
        db.flush()  # necesitamos el id de la version vigente para el historial

        version_vigente = next(v for v in versiones if v.vigente)
        db.add(
            HistorialVigencia(
                documento_id=version_vigente.documento_id,
                version_anterior_id=None,
                version_nueva_id=version_vigente.id,
                persona_id=aprobador.id,
                fecha_hora=version_vigente.fecha_desde_vigencia,
            )
        )

        db.commit()

        print(
            f"Se insertaron {len(tipos)} tipos de documento, {len(documentos)} documentos y "
            f"{len(versiones)} versiones (1 marcada como vigente: '{DOCUMENTO_VIGENTE}')."
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()
