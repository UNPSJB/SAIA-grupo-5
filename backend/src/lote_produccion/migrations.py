from sqlalchemy import Engine, inspect, text

COLUMNAS_LOTE_PRODUCCION = (
    ("producto_id", "INTEGER NULL REFERENCES productos(id)"),
    ("fecha_produccion", "DATE NULL"),
    ("fecha_vencimiento", "DATE NULL"),
    ("cantidad_producida", "INTEGER NULL"),
    ("estado", "VARCHAR NOT NULL DEFAULT 'En produccion'"),
    ("activo", "BOOLEAN NOT NULL DEFAULT 1"),
    ("receta_id", "INTEGER NULL REFERENCES recetas(id)"),
)

SQL_RECETA_POR_FECHA = """
UPDATE lotes_produccion
SET receta_id = COALESCE(
    (
        SELECT r.id FROM recetas r
        WHERE r.producto_id = lotes_produccion.producto_id
          AND (r.fecha_desde_vigencia IS NULL OR r.fecha_desde_vigencia <= datetime(lotes_produccion.fecha_produccion, '+1 day'))
          AND (r.fecha_hasta_vigencia IS NULL OR r.fecha_hasta_vigencia > datetime(lotes_produccion.fecha_produccion, '+1 day'))
        ORDER BY r.version DESC
        LIMIT 1
    ),
    (
        SELECT r.id FROM recetas r
        WHERE r.producto_id = lotes_produccion.producto_id AND r.vigente = 1
        LIMIT 1
    )
)
WHERE receta_id IS NULL
"""


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

        connection.execute(text(
            "CREATE INDEX IF NOT EXISTS ix_lotes_produccion_receta_id ON lotes_produccion (receta_id)"
        ))
        if "recetas" in inspector.get_table_names():
            connection.execute(text(SQL_RECETA_POR_FECHA))
