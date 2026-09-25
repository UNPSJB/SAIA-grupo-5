# scripts/seed_superficies.py
"""
Pobla la base de datos con Superficies basadas en la Tabla 1 (superficies de
contacto directo/indirecto por sector) de la guía práctica de POES.
Requiere haber corrido antes: python -m scripts.seed_sectores
Uso: python -m scripts.seed_superficies
"""
from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.superficies.models import Superficie
from src.sector.models import Sector

# (nombre, tipo_contacto, sector)
SUPERFICIES = [
    ("Paredes, techo, piso y zócalos - Elaboración", "indirecto", "Elaboración"),
    ("Mesadas y útiles de trabajo - Elaboración", "directo", "Elaboración"),
    ("Estanterías y armarios - Elaboración", "indirecto", "Elaboración"),
    ("Paredes, techo, piso y zócalos - Depósito", "indirecto", "Depósito"),
    ("Estanterías, racks y pallets - Depósito", "indirecto", "Depósito"),
    ("Paredes, techo y piso de cámaras - Equipos de frío", "indirecto", "Equipos de frío"),
    ("Paredes, techo, piso y zócalos - Gabinetes higiénicos y vestuarios", "indirecto", "Gabinetes higiénicos y vestuarios"),
    ("Caños, tubos y ductos de ventilación - Depósito", "indirecto", "Depósito"),
    ("Estanterías, estantes y racks - Salón de ventas", "indirecto", "Salón de ventas"),
    ("Útiles - Fiambrería", "directo", "Fiambrería"),
    ("Mesadas de trabajo - Fiambrería", "directo", "Fiambrería"),
    ("Piletas de lavado - Fiambrería", "directo", "Fiambrería"),
    ("Mesadas de trabajo - Rotisería", "directo", "Rotisería"),
    ("Piletas de lavado - Rotisería", "directo", "Rotisería"),
]


def generar_superficies(db) -> list[Superficie]:
    sectores = {s.nombre: s for s in db.scalars(select(Sector)).all()}
    if not sectores:
        return []

    superficies = []
    for nombre, tipo_contacto, nombre_sector in SUPERFICIES:
        sector = sectores.get(nombre_sector)
        superficies.append(
            Superficie(
                nombre=nombre,
                tipo_contacto=tipo_contacto,
                sectores=[sector] if sector else [],
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
