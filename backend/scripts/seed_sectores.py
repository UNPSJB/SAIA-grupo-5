# scripts/seed_sectores.py
"""
Pobla la base de datos con los Sectores de la guía práctica de POES (Tabla 1),
cada uno asociado a los planes de limpieza reales que le corresponden.
Requiere haber corrido antes: python -m scripts.seed_planes_limpieza
Uso: python -m scripts.seed_sectores
"""
from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.sector.models import Sector
from src.plan_limpieza.models import PlanLimpieza

# nombre del sector -> nombres de los planes de limpieza que le corresponden
SECTORES_PLANES = {
    # La cortadora de fiambre pertenece a la sección de Fiambrería, no a Elaboración
    # (corrección respecto de la carga inicial).
    "Elaboración": ["Limpieza de instalaciones - Elaboración"],
    "Depósito": ["Limpieza de ductos y tuberías", "Gestión de recipientes de residuos"],
    "Sector lavandín": [],
    "Equipos de frío": ["Limpieza de equipos de frío"],
    "Gabinetes higiénicos y vestuarios": [],
    "Oficinas y pasillos": [],
    "Salón de ventas": ["Limpieza Salón de ventas"],
    "Fiambrería": [
        "Limpieza cortadora de fiambre",
        "Limpieza Fiambrería - Útiles",
        "Limpieza Fiambrería - Balanzas",
        "Limpieza Fiambrería - Mesadas de trabajo",
        "Limpieza Fiambrería - Piletas de lavado",
    ],
    "Rotisería": [
        "Limpieza Rotisería - Cocina",
        "Limpieza Rotisería - Horno",
        "Limpieza Rotisería - Fritador",
        "Limpieza Rotisería - Campana y extractor",
        "Limpieza Rotisería - Mesadas y piletas",
    ],
}


def generar_sectores(db) -> list[Sector]:
    planes = {p.nombre: p for p in db.scalars(select(PlanLimpieza)).all()}

    sectores = []
    for nombre, nombres_planes in SECTORES_PLANES.items():
        planes_asignados = [planes[n] for n in nombres_planes if n in planes]
        sectores.append(Sector(nombre=nombre, planes=planes_asignados))
    return sectores


def main():
    db = SessionLocal()
    try:
        sectores = generar_sectores(db)

        db.add_all(sectores)
        db.commit()

        print(f"Se insertaron {len(sectores)} sectores.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
