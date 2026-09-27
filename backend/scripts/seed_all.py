# scripts/seed_all.py
"""
Corre todos los scripts de seed

Uso: python -m scripts.seed_all
"""
from scripts import (
    seed_insumos,
    seed_personal,
    seed_planes_limpieza,
    seed_sectores,
    seed_superficies,
    seed_equipos,
    seed_tareas,
    seed_elementos_limpieza,
   # seed_tareas_ocurrencia, para probar generador automatico
)

ORDEN = [
    seed_insumos,
    seed_personal,
    seed_planes_limpieza,
    seed_sectores,            # requiere nada
    seed_superficies,         # requiere seed_sectores
    seed_equipos,             # requiere seed_sectores
    seed_tareas,              # requiere seed_planes_limpieza, seed_sectores, seed_superficies, seed_equipos
    seed_elementos_limpieza,  # requiere nada
    # seed_tareas_ocurrencia,  # requiere seed_tareas
]


def main():
    for modulo in ORDEN:
        nombre = modulo.__name__.split(".")[-1]
        print(f"=== {nombre} ===")
        modulo.main()


if __name__ == "__main__":
    main()
