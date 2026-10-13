# scripts/seed_planCalibracion.py
"""
Pobla la base con PlanCalibracion de ejemplo para algunos de los equipos ya
cargados (balanzas, termómetros, etc.) -- solo puede haber un plan por
equipo (unique=True en PlanCalibracion.equipo_id), así que se reparte entre
distintos equipos en vez de repetir.

Requiere haber corrido antes:
1. python -m scripts.seed_sectores
2. python -m scripts.seed_equipos (al menos un equipo cargado)

Uso: python -m scripts.seed_planCalibracion
"""
from datetime import date, timedelta

from faker import Faker

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.equipos.models import Equipo
from src.planesCalibracion.models import PlanCalibracion

fake = Faker("es_AR")
Faker.seed(42)

# periodicidad en días, y hace cuántos días empezó a regir el plan
PERIODICIDADES = [30, 60, 90, 180]
CANTIDAD_PLANES = 6


def generar_planes_calibracion(db) -> list[PlanCalibracion]:
    equipos = db.query(Equipo).filter(Equipo.estado == True).all()
    if not equipos:
        return []

    hoy = date.today()
    cantidad = min(CANTIDAD_PLANES, len(equipos))
    equipos_elegidos = fake.random_elements(elements=equipos, length=cantidad, unique=True)

    planes = []
    for equipo in equipos_elegidos:
        periodicidad = fake.random_element(elements=PERIODICIDADES)
        # fecha_inicio no puede ser futura (lo valida crear_plan_calibracion), así que
        # siempre la backdateamos entre 1 y 2 periodos para tener un mix de vencidos/vigentes.
        dias_desde_inicio = fake.random_int(min=5, max=periodicidad * 2)

        planes.append(
            PlanCalibracion(
                equipo_id=equipo.id,
                fecha_inicio=hoy - timedelta(days=dias_desde_inicio),
                periodicidad=periodicidad,
            )
        )

    return planes


def main():
    db = SessionLocal()
    try:
        planes = generar_planes_calibracion(db)

        if not planes:
            print("No hay equipos cargados. Correr antes scripts.seed_sectores y scripts.seed_equipos.")
            return

        db.add_all(planes)
        db.commit()

        print(f"Se insertaron {len(planes)} planes de calibración.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
