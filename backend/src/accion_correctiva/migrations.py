from sqlalchemy import Engine, inspect, text


COLUMNAS_ACTUALES = {"id", "descripcion", "fecha", "activo", "incidente_id", "persona_id"}


def migrar_esquema_acciones_correctivas(engine: Engine) -> None:
    """Adapta la tabla heredada de acciones correctivas al modelo actual."""
    inspector = inspect(engine)
    if "acciones_correctivas" not in inspector.get_table_names():
        return

    columnas = {columna["name"] for columna in inspector.get_columns("acciones_correctivas")}
    if COLUMNAS_ACTUALES.issubset(columnas) and "nombre" not in columnas:
        return

    columnas_requeridas = COLUMNAS_ACTUALES - {"activo"}
    if columnas_requeridas.issubset(columnas) and "nombre" not in columnas:
        with engine.begin() as connection:
            connection.execute(text(
                "ALTER TABLE acciones_correctivas "
                "ADD COLUMN activo BOOLEAN NOT NULL DEFAULT 1"
            ))
        return

    # La tabla anterior usaba nombre en vez de fecha/persona; conservar sus
    # registros y completar los nuevos datos desde el incidente relacionado.
    if not {"id", "incidente_id"}.issubset(columnas) or not ({"descripcion", "nombre"} & columnas):
        raise RuntimeError(
            "La tabla acciones_correctivas no contiene los datos mínimos para migrarla."
        )

    if engine.dialect.name != "sqlite":
        raise RuntimeError(
            "La migración de acciones correctivas heredadas solo está implementada para SQLite."
        )

    columnas_incidentes = {
        columna["name"] for columna in inspect(engine).get_columns("incidentes")
    } if "incidentes" in inspector.get_table_names() else set()
    fecha_incidente = (
        "(SELECT fecha_cierre FROM incidentes WHERE incidentes.id = antigua.incidente_id)"
        if "fecha_cierre" in columnas_incidentes
        else "NULL"
    )
    persona_incidente = (
        "(SELECT operario_id FROM incidentes WHERE incidentes.id = antigua.incidente_id)"
        if "operario_id" in columnas_incidentes
        else "NULL"
    )
    fecha = f"COALESCE(antigua.fecha, {fecha_incidente}, CURRENT_TIMESTAMP)" if "fecha" in columnas else f"COALESCE({fecha_incidente}, CURRENT_TIMESTAMP)"
    persona = f"COALESCE(antigua.persona_id, {persona_incidente})" if "persona_id" in columnas else persona_incidente
    activo = "antigua.activo" if "activo" in columnas else "1"
    if "descripcion" in columnas and "nombre" in columnas:
        descripcion = "COALESCE(antigua.descripcion, antigua.nombre)"
    elif "descripcion" in columnas:
        descripcion = "antigua.descripcion"
    else:
        descripcion = "antigua.nombre"

    with engine.begin() as connection:
        sin_persona = connection.execute(
            text(f"SELECT COUNT(*) FROM acciones_correctivas AS antigua WHERE {persona} IS NULL")
        ).scalar_one()
        if sin_persona:
            raise RuntimeError(
                f"No se pueden migrar {sin_persona} acciones correctivas: falta asociarlas a una persona."
            )

        connection.execute(text("""
            CREATE TABLE acciones_correctivas__nueva (
                id INTEGER NOT NULL PRIMARY KEY,
                descripcion VARCHAR(500) NOT NULL,
                fecha DATETIME NOT NULL,
                activo BOOLEAN NOT NULL DEFAULT 1,
                incidente_id INTEGER NOT NULL,
                persona_id INTEGER NOT NULL,
                FOREIGN KEY(incidente_id) REFERENCES incidentes (id),
                FOREIGN KEY(persona_id) REFERENCES personal (id)
            )
        """))
        connection.execute(text(f"""
            INSERT INTO acciones_correctivas__nueva
                (id, descripcion, fecha, activo, incidente_id, persona_id)
            SELECT antigua.id, {descripcion}, {fecha}, {activo}, antigua.incidente_id, {persona}
            FROM acciones_correctivas AS antigua
        """))
        connection.execute(text("DROP TABLE acciones_correctivas"))
        connection.execute(text(
            "ALTER TABLE acciones_correctivas__nueva RENAME TO acciones_correctivas"
        ))
        connection.execute(text(
            "CREATE INDEX ix_acciones_correctivas_id ON acciones_correctivas (id)"
        ))
        connection.execute(text(
            "CREATE INDEX ix_acciones_correctivas_incidente_id "
            "ON acciones_correctivas (incidente_id)"
        ))
