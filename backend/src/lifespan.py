from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import inspect, text, select
from src.database import engine, SessionLocal
from src.models import ModeloBase
from src.personal.models import Persona
from src.auth.utils import get_password_hash
from src.scheduler.scheduler import scheduler, iniciar_scheduler
from src.incidentes.migrations import migrar_esquema_incidentes


@asynccontextmanager
async def db_creation_lifespan(app: FastAPI):
    ModeloBase.metadata.create_all(bind=engine)
    migrar_esquema_incidentes(engine)
    inspector = inspect(engine)
    tablas = inspector.get_table_names()

    if "configuracion_sistema" in tablas:
        columnas_configuracion = {col["name"] for col in inspector.get_columns("configuracion_sistema")}
        migraciones_configuracion = {
            "vista_publica_activa": "BOOLEAN NOT NULL DEFAULT 0",
            "vista_publica_token": "VARCHAR(64)",
            "vista_publica_nombre_establecimiento": "VARCHAR(100) NOT NULL DEFAULT 'Mi establecimiento'",
            "vista_publica_mostrar_cumplimiento": "BOOLEAN NOT NULL DEFAULT 0",
            "vista_publica_mostrar_calibraciones": "BOOLEAN NOT NULL DEFAULT 0",
            "vista_publica_mostrar_tiempo_calibracion": "BOOLEAN NOT NULL DEFAULT 0",
            "vista_publica_mostrar_recambios": "BOOLEAN NOT NULL DEFAULT 0",
            "vista_publica_mostrar_tiempo_recambio": "BOOLEAN NOT NULL DEFAULT 0",
            "vista_publica_mostrar_planes_limpieza": "BOOLEAN NOT NULL DEFAULT 0",
        }
        with engine.begin() as connection:
            for columna, definicion in migraciones_configuracion.items():
                if columna not in columnas_configuracion:
                    connection.execute(text(
                        f"ALTER TABLE configuracion_sistema ADD COLUMN {columna} {definicion}"
                    ))
        if "ix_configuracion_sistema_vista_publica_token" not in {
            indice["name"] for indice in inspector.get_indexes("configuracion_sistema")
        }:
            with engine.begin() as connection:
                connection.execute(text(
                    "CREATE UNIQUE INDEX ix_configuracion_sistema_vista_publica_token "
                    "ON configuracion_sistema (vista_publica_token)"
                ))

    if "personal" in tablas:
        columnas_personal = [col["name"] for col in inspector.get_columns("personal")]
        with engine.begin() as connection:
            if "puede_operar" in columnas_personal and "operar" not in columnas_personal:
                connection.execute(text("ALTER TABLE personal RENAME COLUMN puede_operar TO operar"))
            if "puede_administrar" in columnas_personal and "administrar" not in columnas_personal:
                connection.execute(text("ALTER TABLE personal RENAME COLUMN puede_administrar TO administrar"))
            if "activo" not in columnas_personal:
                connection.execute(text("ALTER TABLE personal ADD COLUMN activo BOOLEAN NOT NULL DEFAULT 1"))
            if "supervisor" not in columnas_personal:
                connection.execute(text("ALTER TABLE personal ADD COLUMN supervisor BOOLEAN NOT NULL DEFAULT 0"))

    if "insumos" in tablas and not any(
        column["name"] == "activo" for column in inspector.get_columns("insumos")
    ):
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE insumos ADD COLUMN activo BOOLEAN NOT NULL DEFAULT 1"))

    if "acciones_correctivas" in tablas and not any(
        column["name"] == "activo" for column in inspector.get_columns("acciones_correctivas")
    ):
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE acciones_correctivas ADD COLUMN activo BOOLEAN NOT NULL DEFAULT 1"))

    # Crear administrador por defecto si no existe
    with SessionLocal() as db:
        admin = db.scalar(select(Persona).where(Persona.username == "admin1"))
        if not admin:
            nuevo_admin = Persona(
                nombre="Admin",
                apellido="Admin",
                dni="00000000",
                mail="admin@admin.com",
                username="admin1",                          # Nombre de usuario para login
                hashed_password=get_password_hash("admin"), # Contraseña de usuario para login
                operar=False,
                administrar=True,
                activo=True,
            )
            db.add(nuevo_admin)
            db.commit()

    iniciar_scheduler()
    yield
    scheduler.shutdown()
