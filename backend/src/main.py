from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import inspect, text
from src.database import engine
from src.models import ModeloBase

# Registra todos los modelos antes de armar las relaciones entre ellos.
from src.insumos.models import Insumo  
from src.personal.models import Persona  
from src.equipos.models import Equipo  
from src.sector.models import Sector  
from src.plan_limpieza.models import PlanLimpieza
from src.tarea.models import Tarea
from src.tareas_ocurrencia.models import TareaOcurrencia

# Importamos la configuración validada por Pydantic
from src.config import settings

# Importamos configuracion de logger
from src.logger import setup_logging

# Importamos los routers desde nuestros modulos
from src.personal.router import router as personal_router
from src.insumos.router import router as insumos_router
from src.equipos.router import router as equipos_router
from src.sector.router import router as sector_router
from src.plan_limpieza.router import router as plan_limpieza_router
from src.tarea.router import router as tarea_router
from src.tareas_ocurrencia.router import router as tareas_ocurrencia_router
from src.scheduler.scheduler import scheduler, iniciar_scheduler
from fastapi.middleware.cors import CORSMiddleware

ENV = settings.ENV.upper()
ROOT_PATH = getattr(settings, f"ROOT_PATH_{ENV}", "")

setup_logging()

@asynccontextmanager
async def db_creation_lifespan(app: FastAPI):
    ModeloBase.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    tablas = inspector.get_table_names()

    if "personal" in tablas and not any(
        column["name"] == "activo" for column in inspector.get_columns("personal")
    ):
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE personal ADD COLUMN activo BOOLEAN NOT NULL DEFAULT 1"))

    if "insumos" in tablas and not any(
        column["name"] == "activo" for column in inspector.get_columns("insumos")
    ):
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE insumos ADD COLUMN activo BOOLEAN NOT NULL DEFAULT 1"))

    if "planes_limpieza" in tablas and not any(
        column["name"] == "activo" for column in inspector.get_columns("planes_limpieza")
    ):
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE planes_limpieza ADD COLUMN activo BOOLEAN NOT NULL DEFAULT 1"))

    iniciar_scheduler()
    yield
    scheduler.shutdown()


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


# asociamos los routers a nuestra app
app.include_router(personal_router)
app.include_router(insumos_router)
app.include_router(equipos_router)
app.include_router(sector_router)
app.include_router(plan_limpieza_router)
app.include_router(tarea_router)
app.include_router(tareas_ocurrencia_router)

