"""
Pobla la base de datos con insumos de prueba y sus unidades de medida.

Si las unidades de medida no existen, las crea automáticamente.

Uso: python -m scripts.seed_insumos
"""

from faker import Faker
from sqlalchemy import select

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


def generar_insumos(cantidad: int, db) -> list[Insumo]:
    cantidad = min(cantidad, len(NOMBRES_INSUMOS))
    nombres = fake.random_elements(elements=list(NOMBRES_INSUMOS), length=cantidad, unique=True)

    inactivos = set(fake.random_elements(
        elements=nombres,
        length=min(CANTIDAD_INSUMOS_INACTIVOS, cantidad),
        unique=True
    ))

    unidades = {
        unidad.nombre: unidad.id
        for unidad in db.scalars(select(UnidadMedida)).all()
    }

    existentes = {
        insumo.nombre
        for insumo in db.scalars(select(Insumo)).all()
    }

    faltantes = {NOMBRES_INSUMOS[nombre] for nombre in nombres} - unidades.keys()
    if faltantes:
        raise ValueError(f"Faltan unidades de medida: {', '.join(sorted(faltantes))}")

    return [
        Insumo(
            nombre=nombre,
            unidad_medida_id=unidades[NOMBRES_INSUMOS[nombre]],
            activo=nombre not in inactivos,
        )
        for nombre in nombres
        if nombre not in existentes
    ]


def main():
    db = SessionLocal()

    try:
        insumos = generar_insumos(CANTIDAD_INSUMOS, db)

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
