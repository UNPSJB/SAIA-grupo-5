from fastapi import FastAPI
from src.settings import ROOT_PATH
from src.logger import setup_logging
from src.lifespan import db_creation_lifespan

# Routers
from src.auth.router import router as auth_router
from src.personal.router import router as personal_router
from src.insumos.router import router as insumos_router
from src.equipos.router import router as equipos_router
from src.consumo_producto.router import router as consumos_router
from fastapi.middleware.cors import CORSMiddleware

setup_logging()


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
app.include_router(consumos_router)

