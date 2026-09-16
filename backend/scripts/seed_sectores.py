# scripts/seed_sectores.py
"""
Pobla la base de datos con Sectores de prueba, cada uno asociado a 1-3
planes de limpieza ya existentes.
Requiere haber corrido antes: python -m scripts.seed_planes_limpieza
Uso: python -m scripts.seed_sectores
"""
from faker import Faker
from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.sector.models import Sector
from src.plan_limpieza.models import PlanLimpieza

fake = Faker("es_AR")
Faker.seed(42)

CANTIDAD_SECTORES = 15

NOMBRES_SECTORES = [
    "Depósito",
    "Elaboración",
    "Envasado",
    "Cámara",
    "Recepción",
    "Expedición",
    "Rampa",
    "Cocina",
    "Obrador",
    "Salón de venta",
    "Zona de fermentación",
    "Laboratorio de calidad",
    "Vestuario",
    "Sanitarios",
    "Oficina administrativa",
]


def generar_sectores(db, cantidad: int) -> list[Sector]:
    cantidad = min(cantidad, len(NOMBRES_SECTORES))
    nombres = fake.random_elements(elements=list(NOMBRES_SECTORES), length=cantidad, unique=True)

    planes = db.scalars(select(PlanLimpieza)).all()

    sectores = []
    for nombre in nombres:
        planes_asignados = fake.random_elements(
            elements=planes, length=min(len(planes), fake.random_int(min=1, max=3)), unique=True
        ) if planes else []
        sectores.append(Sector(nombre=nombre, planes=list(planes_asignados)))
    return sectores


def main():
    db = SessionLocal()
    try:
        sectores = generar_sectores(db, CANTIDAD_SECTORES)

        db.add_all(sectores)
        db.commit()

        print(f"Se insertaron {len(sectores)} sectores.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
