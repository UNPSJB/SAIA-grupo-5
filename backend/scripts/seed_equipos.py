# scripts/seed_equipos.py
"""
Pobla la base de datos con los equipos de ejemplo de la guía práctica de
POES (fiambrería/elaboración), cada uno con su sector y plan de limpieza
reales.
Requiere haber corrido antes: python -m scripts.seed_planes_limpieza
                               python -m scripts.seed_sectores
Uso: python -m scripts.seed_equipos
"""
from sqlalchemy import select

import src.all_models
from src.database import SessionLocal
from src.equipos.models import Equipo
from src.plan_limpieza.models import PlanLimpieza
from src.sector.models import Sector

# (nombre, categoria, sector, plan de limpieza)
EQUIPOS = [
    ("Amasadora", "Elaboración", "Elaboración", "Limpieza de instalaciones - Elaboración"),
    ("Horno", "Cocción", "Elaboración", "Limpieza de instalaciones - Elaboración"),
    # La cortadora de fiambre pertenece a la sección de Fiambrería, no a Elaboración
    # (corrección respecto de la carga inicial).
    ("Cortadora de fiambre", "Elaboración", "Fiambrería", "Limpieza cortadora de fiambre"),
    ("Heladera/vitrina exhibidora", "Refrigeración", "Equipos de frío", "Limpieza de equipos de frío"),
    ("Freezer", "Refrigeración", "Equipos de frío", "Limpieza de equipos de frío"),
    ("Cámara", "Refrigeración", "Equipos de frío", "Limpieza de equipos de frío"),
    ("Recipientes de residuos", "Higiene", "Depósito", "Gestión de recipientes de residuos"),
    ("Balanza", "Medición", "Fiambrería", "Limpieza Fiambrería - Balanzas"),
    ("Cocina", "Cocción", "Rotisería", "Limpieza Rotisería - Cocina"),
    ("Horno", "Cocción", "Rotisería", "Limpieza Rotisería - Horno"),
    ("Fritador", "Cocción", "Rotisería", "Limpieza Rotisería - Fritador"),
    ("Campana y extractor", "Ventilación", "Rotisería", "Limpieza Rotisería - Campana y extractor"),
]


def generar_equipos(db) -> list[Equipo]:
    planes = {p.nombre: p for p in db.scalars(select(PlanLimpieza)).all()}
    if not planes:
        return []
    sectores = {s.nombre: s for s in db.scalars(select(Sector)).all()}

    return [
        Equipo(
            nombre=nombre,
            categoria=categoria,
            ubicacion=nombre_sector,
            plan_limpieza_id=planes[nombre_plan].id,
            sector_id=sectores[nombre_sector].id if nombre_sector in sectores else None,
        )
        for nombre, categoria, nombre_sector, nombre_plan in EQUIPOS
        if nombre_plan in planes
    ]


def main():
    db = SessionLocal()
    try:
        equipos = generar_equipos(db)
        if not equipos:
            print("No hay planes de limpieza cargados. Correr antes scripts.seed_planes_limpieza.")
            return

        db.add_all(equipos)
        db.commit()

        print(f"Se insertaron {len(equipos)} equipos.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
