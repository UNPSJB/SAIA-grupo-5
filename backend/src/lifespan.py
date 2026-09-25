from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import inspect, text, select
from src.database import engine, SessionLocal
from src.models import ModeloBase
from src.personal.models import Persona
from src.auth.utils import get_password_hash
from src.scheduler.scheduler import scheduler, iniciar_scheduler


@asynccontextmanager
async def db_creation_lifespan(app: FastAPI):
    ModeloBase.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    tablas = inspector.get_table_names()

    if "personal" in tablas:
        columnas_personal = [col["name"] for col in inspector.get_columns("personal")]
        with engine.begin() as connection:
            if "puede_operar" in columnas_personal and "operar" not in columnas_personal:
                connection.execute(text("ALTER TABLE personal RENAME COLUMN puede_operar TO operar"))
            if "puede_administrar" in columnas_personal and "administrar" not in columnas_personal:
                connection.execute(text("ALTER TABLE personal RENAME COLUMN puede_administrar TO administrar"))
            if "activo" not in columnas_personal:
                connection.execute(text("ALTER TABLE personal ADD COLUMN activo BOOLEAN NOT NULL DEFAULT 1"))

    if "insumos" in tablas and not any(
        column["name"] == "activo" for column in inspector.get_columns("insumos")
    ):
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE insumos ADD COLUMN activo BOOLEAN NOT NULL DEFAULT 1"))

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
