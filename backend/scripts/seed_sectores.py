# scripts/seed_sectores.py
"""
Pobla la base de datos con los Sectores de la guía práctica de POES (Tabla 1).
Uso: python -m scripts.seed_sectores
"""
from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.sector.models import Sector

NOMBRES_SECTORES = [
    "Elaboración",
    "Depósito",
    "Sector lavandín",
    "Equipos de frío",
    "Gabinetes higiénicos y vestuarios",
    "Oficinas y pasillos",
    "Salón de ventas",
    "Fiambrería",
    "Rotisería",
]


def generar_sectores(db) -> list[Sector]:
    # Idempotente: el nombre es UNIQUE, así que se omiten los ya cargados
    # (seed_all se puede correr más de una vez).
    existentes = set(db.scalars(select(Sector.nombre)).all())
    return [
        Sector(nombre=nombre)
        for nombre in NOMBRES_SECTORES
        if nombre not in existentes
    ]


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
