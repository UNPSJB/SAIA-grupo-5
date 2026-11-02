from sqlalchemy import Engine, inspect, text

COLUMNAS_LOTE_PRODUCCION = (
    ("producto_id", "INTEGER NULL REFERENCES productos(id)"),
    ("fecha_produccion", "DATE NULL"),
    ("fecha_vencimiento", "DATE NULL"),
    ("cantidad_producida", "INTEGER NULL"),
    ("estado", "VARCHAR NOT NULL DEFAULT 'En produccion'"),
    ("activo", "BOOLEAN NOT NULL DEFAULT 1"),
)


def migrar_esquema_lote_produccion(engine: Engine) -> None:
    """Actualiza columnas nuevas de lotes de producción sin recrear ni perder registros."""
    inspector = inspect(engine)
    if "lotes_produccion" not in inspector.get_table_names():
        return

    columnas = {columna["name"] for columna in inspector.get_columns("lotes_produccion")}
    with engine.begin() as connection:
        for columna, definicion in COLUMNAS_LOTE_PRODUCCION:
            if columna not in columnas:
                connection.execute(text(
                    f"ALTER TABLE lotes_produccion ADD COLUMN {columna} {definicion}"
                ))
                columnas.add(columna)
