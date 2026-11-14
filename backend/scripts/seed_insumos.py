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

CAMPOS_NUTRICIONALES = ("valor_energetico", "azucares_anadidos", "grasas_totales", "grasas_saturadas", "sodio", "peso_unidad")

INFORMACION_NUTRICIONAL = {
    "Harina 000": (364, 0, 1.0, 0.2, 2, None),
    "Harina 0000": (364, 0, 1.0, 0.2, 2, None),
    "Azúcar": (400, 100, 0, 0, 0, None),
    "Sal fina": (0, 0, 0, 0, 38758, None),
    "Levadura fresca": (105, 0, 1.9, 0.2, 30, None),
    "Levadura seca": (325, 0, 7.6, 1.0, 51, None),
    "Manteca": (717, 0, 81, 51, 11, None),
    "Aceite de girasol": (884, 0, 100, 10, 0, None),
    "Aceite de oliva": (884, 0, 100, 14, 2, None),
    "Huevo": (143, 0, 9.5, 3.1, 142, 50),
    "Leche entera": (61, 0, 3.3, 1.9, 43, None),
    "Crema de leche": (340, 0, 36, 23, 27, None),
    "Queso cremoso": (300, 0, 24, 15, 600, None),
    "Pollo entero": (215, 0, 15, 4.3, 70, None),
    "Carne picada": (254, 0, 20, 7.7, 66, None),
    "Agua": (0, 0, 0, 0, 0, None),
    "Bicarbonato de sodio": (0, 0, 0, 0, 27360, None),
    "Esencia de vainilla": (288, 0, 0.1, 0, 9, None),
    "Chocolate cobertura": (546, 48, 31, 19, 24, None),
    "Miel": (304, 82, 0, 0, 4, None),
    "Polvo de hornear": (53, 0, 0, 0, 10600, None),
    "Almidón de maíz": (381, 0, 0.1, 0, 9, None),
    "Avena": (389, 0, 6.9, 1.2, 2, None),
    "Canela molida": (247, 0, 1.2, 0.3, 10, None),
    "Almendras": (579, 0, 50, 3.8, 1, None),
    "Nueces": (654, 0, 65, 6.1, 2, None),
    "Pasas de uva": (299, 0, 0.5, 0.1, 11, None),
    "Dulce de leche": (315, 40, 7.5, 4.6, 129, None),
    "Mermelada de frutilla": (250, 48, 0.1, 0, 32, None),
    "Vinagre de alcohol": (18, 0, 0, 0, 2, None),
    "Jugo de limón": (22, 0, 0.2, 0, 1, None),
}


def informacion_nutricional(nombre: str) -> dict:
    valores = INFORMACION_NUTRICIONAL.get(nombre)
    if valores is None:
        return {}
    return dict(zip(CAMPOS_NUTRICIONALES, valores))


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
            **informacion_nutricional(nombre),
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
