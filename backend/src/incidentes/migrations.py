from sqlalchemy import Engine, inspect, text


def migrar_esquema_incidentes(engine: Engine) -> None:
    """Actualiza columnas nuevas de incidentes sin recrear ni perder registros."""
    inspector = inspect(engine)
    if "incidentes" not in inspector.get_table_names():
        return

    columnas = {columna["name"] for columna in inspector.get_columns("incidentes")}
    if "foto_opcional" not in columnas:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE incidentes ADD COLUMN foto_opcional TEXT NULL"))
            columnas.add("foto_opcional")

    # Puede ocurrir que ya se haya añadido foto_opcional, pero sin copiar la columna anterior.
    if "foto" in columnas:
        with engine.begin() as connection:
            connection.execute(
                text("UPDATE incidentes SET foto_opcional = foto WHERE foto_opcional IS NULL")
            )

    # Las bases parciales también pueden no tener los FK añadidos posteriormente.
    for columna, definicion in (
        ("operario_id", "INTEGER NULL REFERENCES personal(id)"),
        ("sector_id", "INTEGER NULL REFERENCES sectores(id)"),
    ):
        if columna not in columnas:
            with engine.begin() as connection:
                connection.execute(text(f"ALTER TABLE incidentes ADD COLUMN {columna} {definicion}"))
            columnas.add(columna)

    if "estado" in columnas:
        with engine.begin() as connection:
            connection.execute(
                text(
                    "UPDATE incidentes SET estado = CASE estado "
                    "WHEN 'abierto' THEN 'Abierto' WHEN 'cerrado' THEN 'Cerrado' END "
                    "WHERE estado IN ('abierto', 'cerrado')"
                )
            )
