# scripts/seed_personal.py
"""
Pobla la base de datos con personal de prueba.
Uso: python -m scripts.seed_personal
"""
import re

from faker import Faker

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.personal.models import Persona
from src.auth.utils import get_password_hash

fake = Faker("es_AR")
Faker.seed(42)

CANTIDAD_PERSONAL = 10


def _slug(texto: str) -> str:
    # Saca espacios/acentos/apóstrofes: fake.first_name() en es_AR puede
    # devolver nombres compuestos ("Thiago Nahuel"), que rompen el mail
    # (EmailStr no acepta espacios) si se usan tal cual.
    return re.sub(r"[^a-z0-9]", "", texto.lower())


def generar_personal(cantidad: int) -> list[Persona]:
    personas = []
    default_password_hash = get_password_hash("password123")

    for i in range(cantidad):
        nombre = fake.first_name()
        apellido = fake.last_name()
        username = f"{_slug(nombre)}{fake.random_int(10, 99)}"
        dni = str(fake.unique.random_number(digits=8, fix_len=True))
        mail = f"{username}@test.com"

        operar = True if i % 2 == 0 else False
        administrar = True if i % 3 == 0 else False
        if not operar and not administrar:
            operar = True

        personas.append(
            Persona(
                nombre=nombre,
                apellido=apellido,
                dni=dni,
                mail=mail,
                username=username,
                hashed_password=default_password_hash,
                operar=operar,
                administrar=administrar,
                activo=True,
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
