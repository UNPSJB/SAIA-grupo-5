# scripts/seed_personal.py
"""
Pobla la base de datos con personal de prueba.
Uso: python -m scripts.seed_personal
"""
from faker import Faker

from src.database import SessionLocal
from src.personal.models import Persona

fake = Faker("es_AR")
Faker.seed(42)

CANTIDAD_PERSONAL = 25


def generar_personal(cantidad: int) -> list[Persona]:
    personas = [
        Persona(nombre=fake.unique.name(), operar=True, administrar=True),  # el/la dueño/a
    ]
    for _ in range(cantidad - 1):
        personas.append(
            Persona(
                nombre=fake.unique.name(),
                operar=fake.boolean(chance_of_getting_true=80),
                administrar=fake.boolean(chance_of_getting_true=25),
            )
        )
    return personas


def main():
    db = SessionLocal()
    try:
        personal = generar_personal(CANTIDAD_PERSONAL)

        db.add_all(personal)
        db.commit()

        print(f"Se insertaron {len(personal)} personas.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
