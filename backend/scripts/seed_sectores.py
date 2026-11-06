# scripts/seed_sectores.py
"""
Pobla la base de datos con los Sectores de la guía práctica de POES (Tabla 1).
Uso: python -m scripts.seed_sectores
"""
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
    return [Sector(nombre=nombre) for nombre in NOMBRES_SECTORES]


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
