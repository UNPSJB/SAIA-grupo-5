# scripts/seed_planes_limpieza.py
"""
Pobla la base de datos con planes de limpieza basados en procedimientos POES.
Correr ANTES que seed_sectores, seed_superficies, seed_tareas y seed_equipos
(todos referencian un PlanLimpieza existente).
Uso: python -m scripts.seed_planes_limpieza
"""
import src.all_models
from src.database import SessionLocal
from src.plan_limpieza.models import PlanLimpieza

PLANES = [
    (
        "Limpieza de instalaciones - Elaboración",
        "Limpieza y desinfección de pisos, paredes, techos, mesadas y útiles de trabajo del área de elaboración.",
    ),
    (
        "Limpieza cortadora de fiambre",
        "Limpieza y desinfección diaria de la cortadora de fiambre, equipo de contacto directo con alimentos.",
    ),
    (
        "Limpieza de equipos de frío",
        "Limpieza y desinfección de heladeras, vitrinas exhibidoras, freezers y cámaras frigoríficas.",
    ),
    (
        "Limpieza de ductos y tuberías",
        "Limpieza de caños, tubos y ductos de ventilación del depósito.",
    ),
    (
        "Gestión de recipientes de residuos",
        "Limpieza y desinfección diaria de los recipientes de residuos del depósito.",
    ),
    (
        "Limpieza Salón de ventas",
        "Limpieza de estanterías, estantes y racks del salón de ventas.",
    ),
    (
        "Limpieza Fiambrería - Útiles",
        "Limpieza y desinfección diaria de los útiles de trabajo de la fiambrería.",
    ),
    (
        "Limpieza Fiambrería - Balanzas",
        "Limpieza y desinfección diaria de las balanzas de la fiambrería.",
    ),
    (
        "Limpieza Fiambrería - Mesadas de trabajo",
        "Limpieza y desinfección diaria de las mesadas de trabajo de la fiambrería.",
    ),
    (
        "Limpieza Fiambrería - Piletas de lavado",
        "Limpieza y desinfección diaria de las piletas de lavado de la fiambrería.",
    ),
    (
        "Limpieza Rotisería - Cocina",
        "Limpieza y desinfección diaria de la cocina de la rotisería.",
    ),
    (
        "Limpieza Rotisería - Horno",
        "Limpieza semanal del horno de la rotisería.",
    ),
    (
        "Limpieza Rotisería - Fritador",
        "Limpieza semanal del fritador de la rotisería.",
    ),
    (
        "Limpieza Rotisería - Campana y extractor",
        "Limpieza semanal de la campana y el extractor de la rotisería.",
    ),
    (
        "Limpieza Rotisería - Mesadas y piletas",
        "Limpieza y desinfección diaria de mesadas de trabajo, piletas de lavado y útiles de la rotisería.",
    ),
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
