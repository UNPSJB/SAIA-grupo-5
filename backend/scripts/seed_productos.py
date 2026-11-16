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
from src.producto.services import generar_codigo_barras
from src.configuracion_sistema.models import ConfiguracionSistema
from src.configuracion_sistema.constants import ID_CONFIGURACION_SISTEMA


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
        configuracion = db.get(ConfiguracionSistema, ID_CONFIGURACION_SISTEMA)

        db.add_all(productos)
        db.flush()

        codigos_utilizados = {
            producto.codigo_producto
            for producto in db.scalars(select(Producto)).all()
            if producto.codigo_producto
        }

        siguiente_codigo = 1

        productos_sin_codigo = db.scalars(
            select(Producto).where(Producto.codigo_producto.is_(None)).order_by(Producto.id)
        ).all()

        for producto in productos_sin_codigo:
            while str(siguiente_codigo).zfill(5) in codigos_utilizados:
                siguiente_codigo += 1

            if siguiente_codigo > 99999:
                raise ValueError("No hay códigos de producto disponibles.")

            producto.codigo_producto = str(siguiente_codigo).zfill(5)
            codigos_utilizados.add(producto.codigo_producto)
            siguiente_codigo += 1

        if configuracion and configuracion.prefijo_empresa:
            productos_sin_barras = db.scalars(
                select(Producto).where(Producto.codigo_barras.is_(None))
            ).all()

            for producto in productos_sin_barras:
                producto.codigo_barras = generar_codigo_barras(
                    configuracion.prefijo_gs1,
                    configuracion.prefijo_empresa,
                    producto.codigo_producto
                )

        db.commit()
        print(f"Se insertaron {len(productos)} productos.")
        print(f"Se asignaron códigos a {len(productos_sin_codigo)} productos.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()



if __name__ == "__main__":
    main()
