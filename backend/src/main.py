from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import inspect, text
from src.database import engine
from src.models import ModeloBase

# Importamos la configuración validada por Pydantic
from src.config import settings

# Importamos configuracion de logger
from src.logger import setup_logging

# Importamos los routers desde nuestros modulos
from src.personal.router import router as personal_router
from src.insumos.router import router as insumos_router
from fastapi.middleware.cors import CORSMiddleware

ENV = settings.ENV.upper()
ROOT_PATH = getattr(settings, f"ROOT_PATH_{ENV}", "")

setup_logging()

@asynccontextmanager
async def db_creation_lifespan(app: FastAPI):
    ModeloBase.metadata.create_all(bind=engine)
    if not any(column["name"] == "activo" for column in inspect(engine).get_columns("personal")):
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE personal ADD COLUMN activo BOOLEAN NOT NULL DEFAULT 1"))
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


# asociamos los routers a nuestra app
app.include_router(personal_router)
app.include_router(insumos_router)
