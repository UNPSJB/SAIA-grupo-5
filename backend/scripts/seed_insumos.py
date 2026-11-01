
"""
Pobla la base de datos con insumos de prueba y sus unidades de medida.

Si las unidades de medida no existen, las crea automáticamente.

Uso: python -m scripts.seed_insumos
"""

from faker import Faker
from sqlalchemy import select

import src.all_models  # noqa: F401

from src.database import SessionLocal
from src.insumos.models import Insumo
from src.unidad_medida.models import UnidadMedida

fake = Faker("es_AR")
Faker.seed(42)

CANTIDAD_INSUMOS = 30
CANTIDAD_INSUMOS_INACTIVOS = 6

NOMBRES_INSUMOS = {
    "Harina 000": "Kilogramo",
    "Harina 0000": "Kilogramo",
    "Azúcar": "Kilogramo",
    "Sal fina": "Kilogramo",
    "Levadura fresca": "Gramo",
    "Levadura seca": "Gramo",
    "Manteca": "Kilogramo",
    "Aceite de girasol": "Litro",
    "Aceite de oliva": "Litro",
    "Huevo": "Unidad",
    "Leche entera": "Litro",
    "Crema de leche": "Litro",
    "Queso cremoso": "Kilogramo",
    "Pollo entero": "Kilogramo",
    "Carne picada": "Kilogramo",
    "Malta pilsen": "Kilogramo",
    "Lúpulo cascade": "Gramo",
    "Agua": "Litro",
    "Bicarbonato de sodio": "Gramo",
    "Esencia de vainilla": "Mililitro",
    "Chocolate cobertura": "Kilogramo",
    "Miel": "Kilogramo",
    "Polvo de hornear": "Gramo",
    "Almidón de maíz": "Kilogramo",
    "Avena": "Kilogramo",
    "Canela molida": "Gramo",
    "Nuez moscada": "Gramo",
    "Almendras": "Kilogramo",
    "Nueces": "Kilogramo",
    "Pasas de uva": "Kilogramo",
    "Dulce de leche": "Kilogramo",
    "Mermelada de frutilla": "Kilogramo",
    "Vinagre de alcohol": "Litro",
    "Jugo de limón": "Litro",
    "Colorante vegetal": "Mililitro",
    "Papel manteca": "Unidad",
    "Bolsas de papel": "Docena",
}


def generar_unidades_medida(db) -> dict[str, UnidadMedida]:
    unidades = {}

    for nombre in set(NOMBRES_INSUMOS.values()):
        unidad = db.scalar(
            select(UnidadMedida).where(UnidadMedida.nombre == nombre)
        )

        if unidad is None:
            unidad = UnidadMedida(nombre=nombre, activo=True)
            db.add(unidad)
            db.flush()

        unidades[nombre] = unidad

    return unidades


def generar_insumos(db, cantidad: int) -> list[Insumo]:
    cantidad = min(cantidad, len(NOMBRES_INSUMOS))

    nombres = fake.random_elements(
        elements=list(NOMBRES_INSUMOS),
        length=cantidad,
        unique=True
    )

    inactivos = set(
        fake.random_elements(
            elements=nombres,
            length=min(CANTIDAD_INSUMOS_INACTIVOS, len(nombres)),
            unique=True
        )
    )

    unidades = generar_unidades_medida(db)

    insumos_existentes = set(
        db.scalars(select(Insumo.nombre)).all()
    )

    return [
        Insumo(
            nombre=nombre,
            unidad_medida_id=unidades[NOMBRES_INSUMOS[nombre]].id,
            activo=nombre not in inactivos
        )
        for nombre in nombres
        if nombre not in insumos_existentes
    ]


def main():
    db = SessionLocal()

    try:
        insumos = generar_insumos(db, CANTIDAD_INSUMOS)

        db.add_all(insumos)
        db.commit()

        inactivos = sum(1 for insumo in insumos if not insumo.activo)

        print(
            f"Se insertaron {len(insumos)} insumos "
            f"({inactivos} inactivos)."
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
