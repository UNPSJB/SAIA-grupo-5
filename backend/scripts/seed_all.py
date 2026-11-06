"""
Corre todos los scripts de seed.
Uso: python -m scripts.seed_all
"""
import src.all_models

from scripts import (
    seed_unidad_medida,
    seed_insumos,
    seed_personal,
    seed_productos,
    seed_planes_limpieza,
    seed_sectores,
    seed_superficies,
    seed_equipos,
    seed_tareas,
    seed_elementos_limpieza,
    seed_incidentes,
    seed_vencimientoPersonal,
    seed_planCalibracion,
    seed_documentos,
    seed_lote_produccion,
)

ORDEN = [
    seed_unidad_medida,
    seed_insumos,
    seed_personal,
    seed_productos,
    seed_planes_limpieza,
    seed_sectores,
    seed_superficies,
    seed_equipos,
    seed_tareas,
    seed_elementos_limpieza,
    seed_incidentes,
    seed_vencimientoPersonal,
    seed_planCalibracion,
    seed_documentos,
    seed_lote_produccion,
]


def main():
    for modulo in ORDEN:
        nombre = modulo.__name__.split(".")[-1]
        print(f"=== {nombre} ===")
        modulo.main()


if __name__ == "__main__":
    main()
