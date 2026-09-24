# scripts/seed_equipos.py
"""
Pobla la base de datos con los equipos de ejemplo de la guía práctica de
POES (fiambrería/elaboración), cada uno con su sector real.
Requiere haber corrido antes: python -m scripts.seed_sectores
Uso: python -m scripts.seed_equipos
"""
from sqlalchemy import select

import src.all_models
from src.database import SessionLocal
from src.equipos.models import Equipo
from src.sector.models import Sector

# (nombre, categoria, sector)
EQUIPOS = [
    ("Amasadora", "Elaboración", "Elaboración"),
    ("Horno", "Cocción", "Elaboración"),
    # La cortadora de fiambre pertenece a la sección de Fiambrería, no a Elaboración
    # (corrección respecto de la carga inicial).
    ("Cortadora de fiambre", "Elaboración", "Fiambrería"),
    ("Heladera/vitrina exhibidora", "Refrigeración", "Equipos de frío"),
    ("Freezer", "Refrigeración", "Equipos de frío"),
    ("Cámara", "Refrigeración", "Equipos de frío"),
    ("Recipientes de residuos", "Higiene", "Depósito"),
    ("Balanza", "Medición", "Fiambrería"),
    ("Cocina", "Cocción", "Rotisería"),
    ("Horno", "Cocción", "Rotisería"),
    ("Fritador", "Cocción", "Rotisería"),
    ("Campana y extractor", "Ventilación", "Rotisería"),
]


def generar_equipos(db) -> list[Equipo]:
    sectores = {s.nombre: s for s in db.scalars(select(Sector)).all()}
    if not sectores:
        return []

    return [
        Equipo(
            nombre=nombre,
            categoria=categoria,
            ubicacion=nombre_sector,
            sector_id=sectores[nombre_sector].id,
        )
        for nombre, categoria, nombre_sector in EQUIPOS
        if nombre_sector in sectores
    ]


def main():
    db = SessionLocal()
    try:
        equipos = generar_equipos(db)
        if not equipos:
            print("No hay sectores cargados. Correr antes scripts.seed_sectores.")
            return

        db.add_all(equipos)
        db.commit()

        print(f"Se insertaron {len(equipos)} equipos.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
