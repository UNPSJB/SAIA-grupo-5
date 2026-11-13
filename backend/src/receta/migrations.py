from sqlalchemy import Engine, inspect, text

COLUMNAS_RECETAS = (
    ("version", "INTEGER NOT NULL DEFAULT 1"),
    ("vigente", "BOOLEAN NOT NULL DEFAULT 1"),
    ("fecha_desde_vigencia", "DATETIME NULL"),
    ("fecha_hasta_vigencia", "DATETIME NULL"),
    ("rendimiento", "FLOAT NULL"),
    ("rendimiento_unidad_medida_id", "INTEGER NULL REFERENCES unidades_medida(id)"),
    ("porcion", "FLOAT NULL"),
    ("porcion_unidad_medida_id", "INTEGER NULL REFERENCES unidades_medida(id)"),
)

COLUMNAS_INSUMOS_RECETA = (
    ("tipo", "VARCHAR(20) NOT NULL DEFAULT 'Ingrediente'"),
    ("aditivo_id", "INTEGER NULL REFERENCES aditivos(id)"),
)

INDICE_RECETA_VIGENTE = "ix_unica_receta_vigente_por_producto"


def _agregar_columnas(connection, tabla: str, existentes: set[str], columnas: tuple) -> None:
    for columna, definicion in columnas:
        if columna not in existentes:
            connection.execute(text(f"ALTER TABLE {tabla} ADD COLUMN {columna} {definicion}"))


def migrar_esquema_recetas(engine: Engine) -> None:
    inspector = inspect(engine)
    tablas = inspector.get_table_names()

    with engine.begin() as connection:
        if "recetas" in tablas:
            columnas = {columna["name"] for columna in inspector.get_columns("recetas")}
            _agregar_columnas(connection, "recetas", columnas, COLUMNAS_RECETAS)
            connection.execute(text(
                "UPDATE recetas SET fecha_desde_vigencia = fecha_creacion WHERE fecha_desde_vigencia IS NULL AND vigente = 1"
            ))

            definicion_indice = connection.execute(
                text("SELECT sql FROM sqlite_master WHERE type = 'index' AND name = :nombre"),
                {"nombre": INDICE_RECETA_VIGENTE},
            ).scalar()
            if definicion_indice is not None and "WHERE" not in definicion_indice.upper():
                connection.execute(text(f"DROP INDEX {INDICE_RECETA_VIGENTE}"))
                definicion_indice = None
            if definicion_indice is None:
                connection.execute(text(
                    f"CREATE UNIQUE INDEX {INDICE_RECETA_VIGENTE} ON recetas (producto_id) WHERE vigente = 1"
                ))

        if "insumos_receta" in tablas:
            columnas = {columna["name"] for columna in inspector.get_columns("insumos_receta")}
            _agregar_columnas(connection, "insumos_receta", columnas, COLUMNAS_INSUMOS_RECETA)
