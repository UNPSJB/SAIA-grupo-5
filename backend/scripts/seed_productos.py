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


# La foto del producto es obligatoria en el modelo (NOT NULL) y en el alta desde la app,
# así que los productos de prueba llevan una imagen placeholder en formato data URL.
FOTO_PRODUCTO_SEED = (
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAAC0CAIAAAAl/ja/AAADVklEQVR42u3dPVICURCF0dFyUW7A1MWSsgHWYWToEgxILEEYmZ/33u3zZVJSZcGxaRgYnj4+vyYppWc3gYCWgJaAloAW0BLQEtAS0BLQAloCWgJaAloCWkBLQEtAS0BLf/Wy5MqH48ktqC16f3s1oSWgZeVY8QFCWneJNaFl5ZCAloCWgBbQEtAS0BLQEtACWgJaAloCWgJaQEtAS0BLQEtAC2gJaAloCWgJaAEtAS0BLQEtAS2gJaAloCWgJaAFtDR1/H1/QGsTza1MA62tZnMT00Brq02jyZf9Aa0czUArSjPQitIMtKI0A60ozUArSjPQitIMtKI0A60ozUArSjPQitIMtKI0A60ozUArSjPQitIMtKI0A60ozUArSjPQitIMtKI0A60ozUArSjPQitIMtKI0A60ozUDTHKUZ6GHOQUgz0FtpzjAdqRnoB892fDiehmadqhno+3f8DbiDmg7WDPTS09APZzpbM9D/k/r+9nopYKD1I14z0HM1/6R81UH/pitoBnqu5ruXdG66iOZpml4IvrtmXP3l8+W/rnL+sTcudTSb0A9qHmhUl9IM9CLN/ZuuptnKMXdpnmO6t/WjoGYTegXNfY7qmppLg776+vHCO74T02U11wW9ZGm+a7rtwZfKmouC3k5z81FdXHNF0LePAg5tmuZyoFdfmvtZP2iuBXqLp4D9jGqaa4HeYWluaJrmWqCba950/aC5FujdngI2GdU01wLdamnexzTNU533cnSyZmz33g+aC03ozjUvH9U0FwI9iuaHTdNcaOXoc2lecf2gudCEHlHzv0Y1zVVANzwKuJtpmqusHGMtzQ+vHzSXmNBJmmf+/TTHgu7tKOAOpmmOBR3/QHz5z0lz5g4duWbcYH04nlCOndClNBvM4aALalbsyuHVK+VMaJoVMqGtGcqZ0DQrBzTNylk5LM3KmdA0K2RCWzOUM6FpVg5ompWzclialTOhaVbIhLZmKGdC06wc0DQrCvTlh4toVsiTQpSVAPrsmGblTGia5TQGEtACWgJaAloCWgJaQEtAS0BLQEtAC2gJaGka80Oyc75yXTKhJaBVuKePzy+3gkxoCWgJaAloAS0BLQEtAS0BLaAloCWgJaAloAW0BLQEtAS0dLVv6qbnpxuRuqAAAAAASUVORK5CYII="
)

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
            foto_producto=FOTO_PRODUCTO_SEED,
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
