from sqlalchemy import Engine, inspect, text

COLUMNAS_INSUMOS = (
    ("valor_energetico", "FLOAT NULL"),
    ("azucares_anadidos", "FLOAT NULL"),
    ("grasas_totales", "FLOAT NULL"),
    ("grasas_saturadas", "FLOAT NULL"),
    ("sodio", "FLOAT NULL"),
    ("peso_unidad", "FLOAT NULL"),
    ("aporta_azucares", "BOOLEAN NOT NULL DEFAULT 0"),
    ("aporta_grasas", "BOOLEAN NOT NULL DEFAULT 0"),
    ("aporta_sodio", "BOOLEAN NOT NULL DEFAULT 0"),
    ("aporta_edulcorantes", "BOOLEAN NOT NULL DEFAULT 0"),
    ("aporta_cafeina", "BOOLEAN NOT NULL DEFAULT 0"),
)


def migrar_esquema_insumos(engine: Engine) -> None:
    inspector = inspect(engine)
    if "insumos" not in inspector.get_table_names():
        return

    columnas = {columna["name"] for columna in inspector.get_columns("insumos")}
    with engine.begin() as connection:
        for columna, definicion in COLUMNAS_INSUMOS:
            if columna not in columnas:
                connection.execute(text(
                    f"ALTER TABLE insumos ADD COLUMN {columna} {definicion}"
                ))
                columnas.add(columna)
