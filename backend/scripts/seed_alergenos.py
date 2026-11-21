"""
Pobla la base de datos con el catálogo oficial de alérgenos del CAA
y asocia los alérgenos y la condición de gluten a los insumos existentes.

Uso: python -m scripts.seed_alergenos
"""

from sqlalchemy import select

import src.all_models  # noqa: F401
from src.alergenos.models import Alergeno, InsumoAlergeno
from src.database import SessionLocal, engine
from src.insumos.migrations import migrar_esquema_insumos
from src.insumos.models import Insumo
from src.models import ModeloBase

# Catálogo oficial según Código Alimentario Argentino (Art. 235 séptimo)
# (nombre, descripcion, es_tacc)
ALERGENOS_CAA = [
    ("Trigo", "Trigo, sus cepas híbridas y productos derivados.", True),
    ("Centeno", "Centeno, sus cepas híbridas y productos derivados.", True),
    ("Cebada", "Cebada, sus cepas híbridas y productos derivados.", True),
    ("Avena", "Avena, sus cepas híbridas y productos derivados.", True),
    ("Crustáceos", "Crustáceos y productos derivados.", False),
    ("Huevo", "Huevos y productos derivados.", False),
    ("Pescado", "Pescado y productos derivados.", False),
    ("Maní", "Maní y productos derivados.", False),
    ("Soja", "Soja y productos derivados.", False),
    ("Leche", "Leche y productos derivados (incluida la lactosa).", False),
    ("Almendras", "Frutos secos: almendras y productos derivados.", False),
    ("Avellanas", "Frutos secos: avellanas y productos derivados.", False),
    ("Nueces", "Frutos secos: nueces y productos derivados.", False),
    ("Castañas", "Frutos secos: castañas de cajú / pará y productos derivados.", False),
    ("Pistachos", "Frutos secos: pistachos y productos derivados.", False),
    ("Dióxido de azufre y sulfitos", "Sulfitos en concentraciones superiores a 10 mg/kg.", False),
]

# Mapeo de insumos de prueba -> lista de tuplas (nombre_alergeno, es_derivado)
ALERGENOS_POR_INSUMO: dict[str, list[tuple[str, bool]]] = {
    "Harina 000": [("Trigo", False)],
    "Harina 0000": [("Trigo", False)],
    "Avena": [("Avena", False)],
    "Malta pilsen": [("Cebada", True)],
    "Huevo": [("Huevo", False)],
    "Leche entera": [("Leche", False)],
    "Crema de leche": [("Leche", True)],
    "Manteca": [("Leche", True)],
    "Queso cremoso": [("Leche", True)],
    "Dulce de leche": [("Leche", True)],
    "Fermento láctico": [("Leche", True)],
    "Cuajo": [("Leche", True)],
    "Almendras": [("Almendras", False)],
    "Nueces": [("Nueces", False)],
}


def generar_alergenos(db) -> list[Alergeno]:
    existentes = {a.nombre: a for a in db.scalars(select(Alergeno)).all()}
    nuevos = []
    for nombre, descripcion, es_tacc in ALERGENOS_CAA:
        if nombre not in existentes:
            alergeno = Alergeno(
                nombre=nombre,
                descripcion=descripcion,
                es_tacc=es_tacc,
                activo=True,
            )
            db.add(alergeno)
            nuevos.append(alergeno)
    return nuevos


def asociar_alergenos_a_insumos(db) -> int:
    catalogo = {a.nombre: a for a in db.scalars(select(Alergeno)).all()}
    insumos = db.scalars(
        select(Insumo).where(Insumo.nombre.in_(ALERGENOS_POR_INSUMO.keys()))
    ).all()

    asociaciones_creadas = 0
    for insumo in insumos:
        relaciones_actuales = {rel.alergeno_id for rel in insumo.alergenos}
        tiene_tacc = False

        for nombre_alergeno, es_derivado in ALERGENOS_POR_INSUMO[insumo.nombre]:
            alergeno = catalogo.get(nombre_alergeno)
            if alergeno is None:
                continue
            if alergeno.es_tacc:
                tiene_tacc = True
            if alergeno.id not in relaciones_actuales:
                db.add(
                    InsumoAlergeno(
                        insumo_id=insumo.id,
                        alergeno_id=alergeno.id,
                        es_derivado=es_derivado,
                    )
                )
                asociaciones_creadas += 1

        if tiene_tacc:
            insumo.contiene_gluten = True

    return asociaciones_creadas


def main():
    ModeloBase.metadata.create_all(bind=engine)
    migrar_esquema_insumos(engine)
    db = SessionLocal()
    try:
        nuevos = generar_alergenos(db)
        db.flush()
        asociaciones = asociar_alergenos_a_insumos(db)
        db.commit()
        print(
            f"Se insertaron {len(nuevos)} alérgenos y "
            f"{asociaciones} asociaciones con insumos."
        )
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()

