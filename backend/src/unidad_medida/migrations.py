from sqlalchemy import Engine, inspect, text

COLUMNAS_UNIDADES_MEDIDA = (
    ("codigo", "VARCHAR(10) NULL"),
    ("masa_volumen", "VARCHAR(10) NULL"),
    ("factor_a_base", "FLOAT NULL"),
)

INDICE_CODIGO = "ix_unidades_medida_codigo"


def migrar_esquema_unidades_medida(engine: Engine) -> None:
    inspector = inspect(engine)
    if "unidades_medida" not in inspector.get_table_names():
        return

    columnas = {columna["name"] for columna in inspector.get_columns("unidades_medida")}
    indices = {indice["name"] for indice in inspector.get_indexes("unidades_medida")}
    with engine.begin() as connection:
        for nombre_anterior in ("familia", "masavolumen"):
            if nombre_anterior in columnas and "masa_volumen" not in columnas:
                connection.execute(text(f"ALTER TABLE unidades_medida RENAME COLUMN {nombre_anterior} TO masa_volumen"))
                columnas = (columnas - {nombre_anterior}) | {"masa_volumen"}
        for columna, definicion in COLUMNAS_UNIDADES_MEDIDA:
            if columna not in columnas:
                connection.execute(text(f"ALTER TABLE unidades_medida ADD COLUMN {columna} {definicion}"))
        if INDICE_CODIGO not in indices:
            connection.execute(text(f"CREATE UNIQUE INDEX {INDICE_CODIGO} ON unidades_medida (codigo)"))
