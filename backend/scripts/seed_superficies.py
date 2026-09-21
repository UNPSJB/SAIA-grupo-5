# scripts/seed_superficies.py
"""
Pobla la base de datos con Superficies basadas en la Tabla 1 (superficies de
contacto directo/indirecto por sector) de la guía práctica de POES.
Requiere haber corrido antes: python -m scripts.seed_planes_limpieza
                               python -m scripts.seed_sectores
Uso: python -m scripts.seed_superficies
"""
from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.superficies.models import Superficie
from src.sector.models import Sector
from src.plan_limpieza.models import PlanLimpieza

# (nombre, tipo_contacto, sector, plan de limpieza o None si no tiene uno asignado)
SUPERFICIES = [
    (
        "Paredes, techo, piso y zócalos - Elaboración",
        "indirecto",
        "Elaboración",
        "Limpieza de instalaciones - Elaboración",
    ),
    (
        "Mesadas y útiles de trabajo - Elaboración",
        "directo",
        "Elaboración",
        "Limpieza de instalaciones - Elaboración",
    ),
    (
        "Estanterías y armarios - Elaboración",
        "indirecto",
        "Elaboración",
        None,
    ),
    (
        "Paredes, techo, piso y zócalos - Depósito",
        "indirecto",
        "Depósito",
        None,
    ),
    (
        "Estanterías, racks y pallets - Depósito",
        "indirecto",
        "Depósito",
        None,
    ),
    (
        "Paredes, techo y piso de cámaras - Equipos de frío",
        "indirecto",
        "Equipos de frío",
        "Limpieza de equipos de frío",
    ),
    (
        "Paredes, techo, piso y zócalos - Gabinetes higiénicos y vestuarios",
        "indirecto",
        "Gabinetes higiénicos y vestuarios",
        None,
    ),
    (
        "Caños, tubos y ductos de ventilación - Depósito",
        "indirecto",
        "Depósito",
        "Limpieza de ductos y tuberías",
    ),
    (
        "Estanterías, estantes y racks - Salón de ventas",
        "indirecto",
        "Salón de ventas",
        "Limpieza Salón de ventas",
    ),
    (
        "Útiles - Fiambrería",
        "directo",
        "Fiambrería",
        "Limpieza Fiambrería - Útiles",
    ),
    (
        "Mesadas de trabajo - Fiambrería",
        "directo",
        "Fiambrería",
        "Limpieza Fiambrería - Mesadas de trabajo",
    ),
    (
        "Piletas de lavado - Fiambrería",
        "directo",
        "Fiambrería",
        "Limpieza Fiambrería - Piletas de lavado",
    ),
    (
        "Mesadas de trabajo - Rotisería",
        "directo",
        "Rotisería",
        "Limpieza Rotisería - Mesadas y piletas",
    ),
    (
        "Piletas de lavado - Rotisería",
        "directo",
        "Rotisería",
        "Limpieza Rotisería - Mesadas y piletas",
    ),
]


def generar_superficies(db) -> list[Superficie]:
    sectores = {s.nombre: s for s in db.scalars(select(Sector)).all()}
    planes = {p.nombre: p for p in db.scalars(select(PlanLimpieza)).all()}
    if not sectores:
        return []

    superficies = []
    for nombre, tipo_contacto, nombre_sector, nombre_plan in SUPERFICIES:
        sector = sectores.get(nombre_sector)
        plan = planes.get(nombre_plan) if nombre_plan else None
        superficies.append(
            Superficie(
                nombre=nombre,
                tipo_contacto=tipo_contacto,
                sectores=[sector] if sector else [],
                planes=[plan] if plan else [],
            )
        )
    return superficies


def main():
    db = SessionLocal()
    try:
        superficies = generar_superficies(db)
        if not superficies:
            print("No hay sectores cargados. Correr antes scripts.seed_sectores.")
            return

        db.add_all(superficies)
        db.commit()

        print(f"Se insertaron {len(superficies)} superficies.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
