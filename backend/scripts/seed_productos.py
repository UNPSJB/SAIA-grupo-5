"""
Pobla la base de datos con productos de prueba.
Uso: python -m scripts.seed_productos
"""
from datetime import date
from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.producto.models import Producto
from src.unidad_medida.models import UnidadMedida


NOMBRES_PRODUCTOS = [
    ("Yogur natural", "Yogur elaborado con leche entera", 1000, "Mililitro"),
    ("Queso cremoso", "Queso cremoso fresco", 500, "Gramo"),
    ("Dulce de leche", "Dulce de leche tradicional", 400, "Gramo"),
    ("Leche entera", "Leche entera pasteurizada", 1000, "Mililitro"),
    ("Manteca", "Manteca tradicional", 200, "Gramo"),
    ("Pan de campo", "Pan de campo de masa madre", 500, "Gramo"),
    ("Galletitas de avena", "Galletitas dulces de avena y manteca", 200, "Gramo"),
    ("Agua saborizada de limón", "Agua saborizada con jugo de limón", 500, "Mililitro"),
    ("Granola natural", "Granola de avena con frutos secos sin azúcar agregada", 300, "Gramo"),
    ("Alfajor de maicena", "Alfajor de maicena relleno con dulce de leche", 1, "Unidad"),
    ("Caldo de verduras", "Caldo casero de verduras", 1000, "Mililitro"),
]


def generar_productos(db) -> list[Producto]:
    unidades = {
        unidad.nombre: unidad.id
        for unidad in db.scalars(select(UnidadMedida)).all()
    }

    existentes = {
        producto.nombre
        for producto in db.scalars(select(Producto)).all()
    }

    return [
        Producto(
            nombre=nombre,
            descripcion=descripcion,
            cantidad_neta=cantidad,
            unidad_medida_id=unidades[unidad],
            fecha_lanzamiento=date(2026, 1, 1),
            foto_producto=None,
            activo=True
        )
        for nombre, descripcion, cantidad, unidad in NOMBRES_PRODUCTOS
        if nombre not in existentes
    ]


def main():
    db = SessionLocal()
    try:
        productos = generar_productos(db)

        db.add_all(productos)
        db.commit()

        print(f"Se insertaron {len(productos)} productos.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
