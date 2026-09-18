from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import inspect, text, select
from src.database import engine, SessionLocal
from src.models import ModeloBase
from src.settings import ROOT_PATH
from src.logger import setup_logging

# Routers
from src.auth.router import router as auth_router
from src.personal.router import router as personal_router
from src.insumos.router import router as insumos_router
from src.equipos.router import router as equipos_router
from src.personal.models import Persona
from src.auth.utils import get_password_hash
from fastapi.middleware.cors import CORSMiddleware

setup_logging()


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
                username="admin1",
                hashed_password=get_password_hash("admin"),
                operar=False,
                administrar=True,
                activo=True,
            )
            db.add(nuevo_admin)
            db.commit()

    yield


app = FastAPI(root_path=ROOT_PATH, lifespan=db_creation_lifespan)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Asociamos los routers a nuestra app
app.include_router(auth_router)
app.include_router(personal_router)
app.include_router(insumos_router)
app.include_router(equipos_router)
