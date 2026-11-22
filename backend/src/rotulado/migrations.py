from sqlalchemy import Engine, inspect, text

COLUMNAS = {
    "reglas_rotulado": (
        ("formato_declaracion_aditivos", "VARCHAR(20) NOT NULL DEFAULT 'nombre_e_ins'"),
    ),
    "rotulado_productos": (
        ("orden_ingredientes_manual", "JSON NULL"),
    ),
}

def migrar_esquema_rotulado(engine: Engine) -> None:
    inspector = inspect(engine)
    tablas = inspector.get_table_names()
    with engine.begin() as connection:
        for tabla, columnas_nuevas in COLUMNAS.items():
            if tabla not in tablas:
                continue
            existentes = {c["name"] for c in inspector.get_columns(tabla)}
            for columna, definicion in columnas_nuevas:
                if columna not in existentes:
                    connection.execute(text(f"ALTER TABLE {tabla} ADD COLUMN {columna} {definicion}"))