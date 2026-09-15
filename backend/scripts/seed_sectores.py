# scripts/seed_sectores.py
"""
Pobla la base de datos con Sectores de prueba.
Uso: python -m scripts.seed_sectores
"""
from faker import Faker

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.sector.models import Sector

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


def generar_sectores(cantidad: int) -> list[Sector]:
    cantidad = min(cantidad, len(NOMBRES_SECTORES))
    nombres = fake.random_elements(elements=list(NOMBRES_SECTORES), length=cantidad, unique=True)

    return [
        Sector(
            nombre=nombre,
        )
        for nombre in nombres
    ]


def main():
    db = SessionLocal()
    try:
        sectores = generar_sectores(CANTIDAD_SECTORES)

        db.add_all(sectores)
        db.commit()

        print(f"Se insertaron {len(sectores)} sectores.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
