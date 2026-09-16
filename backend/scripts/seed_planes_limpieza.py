# scripts/seed_planes_limpieza.py
"""
Pobla la base de datos con planes de limpieza de prueba.
Correr ANTES que seed_sectores, seed_tareas y seed_equipos (todos referencian
un PlanLimpieza existente).
Uso: python -m scripts.seed_planes_limpieza
"""
import src.all_models 
from src.database import SessionLocal
from src.plan_limpieza.models import PlanLimpieza

PLANES = [
    ("Limpieza de cocina", "Limpieza y desinfección diaria de superficies de cocina."),
    ("Limpieza de obrador", "Limpieza y desinfección de la zona de elaboración."),
    ("Limpieza de cámaras frigoríficas", "Desinfección y control de temperatura de cámaras."),
    ("Limpieza de depósito", "Orden y limpieza de la zona de almacenamiento."),
    ("Limpieza de salón de venta", "Limpieza de mostradores y zona de atención al público."),
    ("Higiene de sanitarios y vestuarios", "Limpieza y desinfección de baños y vestuarios del personal."),
    ("Limpieza de equipos de refrigeración", "Desinfección interna y externa de heladeras y freezers."),
    ("Control de plagas", "Inspección y aplicación de medidas de control de plagas."),
]


def generar_planes_limpieza() -> list[PlanLimpieza]:
    return [
        PlanLimpieza(nombre=nombre, descripcion=descripcion)
        for nombre, descripcion in PLANES
    ]


def main():
    db = SessionLocal()
    try:
        planes = generar_planes_limpieza()

        db.add_all(planes)
        db.commit()

        print(f"Se insertaron {len(planes)} planes de limpieza.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
