"""
Pobla la base de datos con unidades de medida.
Uso: python -m scripts.seed_unidad_medida
"""
from sqlalchemy import select

from src.database import SessionLocal
from src.unidad_medida.models import UnidadMedida


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

        print(f"Se insertaron {len(unidades)} unidades de medida.")
    finally:
        db.close()


if __name__ == "__main__":
    main()