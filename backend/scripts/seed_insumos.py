# scripts/seed_insumos.py
"""
Pobla la base de datos con insumos de prueba.
Uso: python -m scripts.seed_insumos
"""
from faker import Faker

from src.database import SessionLocal
from src.insumos.constants import UnidadMedida
from src.insumos.models import Insumo

fake = Faker("es_AR")
Faker.seed(42)

CANTIDAD_INSUMOS = 30

NOMBRES_INSUMOS = {
    "Harina 000": UnidadMedida.KILOGRAMO,
    "Harina 0000": UnidadMedida.KILOGRAMO,
    "Azúcar": UnidadMedida.KILOGRAMO,
    "Sal fina": UnidadMedida.KILOGRAMO,
    "Levadura fresca": UnidadMedida.GRAMO,
    "Levadura seca": UnidadMedida.GRAMO,
    "Manteca": UnidadMedida.KILOGRAMO,
    "Aceite de girasol": UnidadMedida.LITRO,
    "Aceite de oliva": UnidadMedida.LITRO,
    "Huevo": UnidadMedida.UNIDAD,
    "Leche entera": UnidadMedida.LITRO,
    "Crema de leche": UnidadMedida.LITRO,
    "Queso cremoso": UnidadMedida.KILOGRAMO,
    "Pollo entero": UnidadMedida.KILOGRAMO,
    "Carne picada": UnidadMedida.KILOGRAMO,
    "Malta pilsen": UnidadMedida.KILOGRAMO,
    "Lúpulo cascade": UnidadMedida.GRAMO,
    "Agua": UnidadMedida.LITRO,
    "Bicarbonato de sodio": UnidadMedida.GRAMO,
    "Esencia de vainilla": UnidadMedida.MILILITRO,
    "Chocolate cobertura": UnidadMedida.KILOGRAMO,
    "Miel": UnidadMedida.KILOGRAMO,
    "Polvo de hornear": UnidadMedida.GRAMO,
    "Almidón de maíz": UnidadMedida.KILOGRAMO,
    "Avena": UnidadMedida.KILOGRAMO,
    "Canela molida": UnidadMedida.GRAMO,
    "Nuez moscada": UnidadMedida.GRAMO,
    "Almendras": UnidadMedida.KILOGRAMO,
    "Nueces": UnidadMedida.KILOGRAMO,
    "Pasas de uva": UnidadMedida.KILOGRAMO,
    "Dulce de leche": UnidadMedida.KILOGRAMO,
    "Mermelada de frutilla": UnidadMedida.KILOGRAMO,
    "Vinagre de alcohol": UnidadMedida.LITRO,
    "Jugo de limón": UnidadMedida.LITRO,
    "Colorante vegetal": UnidadMedida.MILILITRO,
    "Papel manteca": UnidadMedida.UNIDAD,
    "Bolsas de papel": UnidadMedida.DOCENA,
}


def generar_insumos(cantidad: int) -> list[Insumo]:
    cantidad = min(cantidad, len(NOMBRES_INSUMOS))
    nombres = fake.random_elements(elements=list(NOMBRES_INSUMOS), length=cantidad, unique=True)
    return [
        Insumo(nombre=nombre, unidad_medida=NOMBRES_INSUMOS[nombre])
        for nombre in nombres
    ]


def main():
    db = SessionLocal()
    try:
        insumos = generar_insumos(CANTIDAD_INSUMOS)

        db.add_all(insumos)
        db.commit()

        print(f"Se insertaron {len(insumos)} insumos.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
