"""Carga personal de ejemplo con Faker.

Requiere el backend corriendo en http://localhost:8000

Uso (desde la carpeta backend):
    pip install Faker
    python -m scripts.seed_personal
"""

from __future__ import annotations

import json
import random
import urllib.request

from faker import Faker

fake = Faker("es_AR")
Faker.seed(42)
random.seed(42)

URL = "http://localhost:8000/personal/"


def seed_personal(cantidad: int = 15) -> None:
    creadas = 0
    for _ in range(cantidad):
        operar = fake.boolean()
        administrar = fake.boolean()
        # Al menos una capacidad, para datos de prueba más útiles
        if not operar and not administrar:
            operar = True

        payload = {
            "nombre": fake.name()[:40],
            "operar": operar,
            "administrar": administrar,
        }
        data = json.dumps(payload).encode()
        req = urllib.request.Request(
            URL,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req) as resp:
            body = json.loads(resp.read().decode())
            caps = sorted(body.get("capacidades") or [])
            print(f"{body['id']}: {body['nombre']} | {caps}")
            creadas += 1

    print(f"Se cargaron {creadas} personas en personal.")


if __name__ == "__main__":
    seed_personal(15)
