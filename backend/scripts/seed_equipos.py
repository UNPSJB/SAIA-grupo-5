# scripts/seed_equipos.py
"""
Pobla la base de datos con equipos de prueba, cada uno con un plan de
limpieza obligatorio y un sector opcional.
Requiere haber corrido antes: python -m scripts.seed_planes_limpieza
                               python -m scripts.seed_sectores (opcional)
Uso: python -m scripts.seed_equipos
"""
from faker import Faker
from sqlalchemy import select

import src.all_models
from src.database import SessionLocal
from src.equipos.models import Equipo
from src.plan_limpieza.models import PlanLimpieza
from src.sector.models import Sector

fake = Faker("es_AR")
Faker.seed(42)

CANTIDAD_EQUIPOS = 16

EQUIPOS = [
    ("Heladera exhibidora", "Refrigeración"),
    ("Freezer horizontal", "Refrigeración"),
    ("Horno pastelero", "Cocción"),
    ("Horno de barro", "Cocción"),
    ("Balanza digital", "Medición"),
    ("Termómetro de cocina", "Medición"),
    ("Amasadora", "Elaboración"),
    ("Batidora industrial", "Elaboración"),
    ("Selladora de bolsas", "Envasado"),
    ("Fermentador", "Elaboración"),
    ("Olla cervecera", "Elaboración"),
    ("Cámara de fermentación", "Elaboración"),
    ("Cámara frigorífica", "Refrigeración"),
    ("Mesa de acero inoxidable", "Elaboración"),
    ("Rebanadora de pan", "Elaboración"),
    ("Sobadora", "Elaboración"),
    ("Lavamanos industrial", "Higiene"),
    ("Dispensador de alcohol en gel", "Higiene"),
    ("Carro transportador", "Transporte"),
    ("Balanza de piso", "Medición"),
]
UBICACIONES = ["Cocina", "Obrador", "Depósito", "Salón de venta", "Zona de fermentación"]


def generar_equipos(db, cantidad: int) -> list[Equipo]:
    cantidad = min(cantidad, len(EQUIPOS))
    elegidos = fake.random_elements(elements=EQUIPOS, length=cantidad, unique=True)

    planes = db.scalars(select(PlanLimpieza)).all()
    if not planes:
        return []
    sectores = db.scalars(select(Sector)).all()

    return [
        Equipo(
            nombre=nombre,
            categoria=categoria,
            ubicacion=fake.random_element(elements=UBICACIONES),
            plan_limpieza_id=fake.random_element(elements=planes).id,
            sector_id=fake.random_element(elements=sectores).id if sectores else None,
        )
        for nombre, categoria in elegidos
    ]


def main():
    db = SessionLocal()
    try:
        equipos = generar_equipos(db, CANTIDAD_EQUIPOS)
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
