"""
Pobla la base de datos con unidades de medida.
Uso: python -m scripts.seed_unidad_medida
"""
from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.unidad_medida.models import UnidadMedida
from src.unidad_medida.services import cargar_unidades_estandar


NOMBRES_UNIDADES = [
    "Kilogramo", "Gramo", "Litro",
    "Mililitro", "Unidad", "Docena"
]


def generar_unidades_medida(db) -> list[UnidadMedida]:
    existentes = db.scalars(select(UnidadMedida)).all()
    nombres = {unidad.nombre for unidad in existentes}

    return [
        UnidadMedida(nombre=nombre, activo=True)
        for nombre in NOMBRES_UNIDADES
        if nombre not in nombres
    ]


def main():
    db = SessionLocal()
    try:
        unidades = generar_unidades_medida(db)

        db.add_all(unidades)
        db.commit()
        # Completa codigo/masa_volumen/factor de mg, g, kg, ml y l (lo mismo que hace el arranque de la app)
        cargar_unidades_estandar(db)

        print(f"Se insertaron {len(unidades)} unidades de medida.")
    finally:
        db.close()


if __name__ == "__main__":
    main()