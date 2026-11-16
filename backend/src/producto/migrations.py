from sqlalchemy import Engine, inspect, text

COLUMNAS_PRODUCTOS = (
    ("envasado_ausencia_cliente", "BOOLEAN NULL"),
    ("azucares_agregados", "BOOLEAN NULL"),
    ("grasas_agregadas", "BOOLEAN NULL"),
    ("sodio_agregado", "BOOLEAN NULL"),
    ("contiene_edulcorantes", "BOOLEAN NULL"),
    ("contiene_cafeina", "BOOLEAN NULL"),
)


def migrar_esquema_productos(engine: Engine) -> None:
    inspector = inspect(engine)
    if "productos" not in inspector.get_table_names():
        return

    columnas = {columna["name"] for columna in inspector.get_columns("productos")}
    with engine.begin() as connection:
        for columna, definicion in COLUMNAS_PRODUCTOS:
            if columna not in columnas:
                connection.execute(text(f"ALTER TABLE productos ADD COLUMN {columna} {definicion}"))
                columnas.add(columna)
