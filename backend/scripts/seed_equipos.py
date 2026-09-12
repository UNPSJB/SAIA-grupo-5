# scripts/seed_equipos.py
"""
Pobla la base de datos con equipos de prueba.
Uso: python -m scripts.seed_equipos
"""
from faker import Faker

from src.database import SessionLocal
from src.equipos.models import Equipo

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


def generar_equipos(cantidad: int) -> list[Equipo]:
    cantidad = min(cantidad, len(EQUIPOS))
    elegidos = fake.random_elements(elements=EQUIPOS, length=cantidad, unique=True)
    return [
        Equipo(
            nombre=nombre,
            categoria=categoria,
            ubicacion=fake.random_element(elements=UBICACIONES),
        )
        for nombre, categoria in elegidos
    ]


def main():
    db = SessionLocal()
    try:
        equipos = generar_equipos(CANTIDAD_EQUIPOS)

        db.add_all(equipos)
        db.commit()

        print(f"Se insertaron {len(equipos)} equipos.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
