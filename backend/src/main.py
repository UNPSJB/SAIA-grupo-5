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
from src.superficies.models import Superficie
from src.elementosLimpieza.models import ElementoLimpieza, TipoElementoLimpieza
from src.recambiosElementosLimpieza.models import RecambioElementoLimpieza
from src.insumo_quimico.models import InsumoQuimico
from src.tipo_quimico.models import TipoQuimico
from src.consumo_producto.models import ConsumoProducto
from src.planesCalibracion.models import PlanCalibracion
from src.registrosCalibracion.models import RegistroCalibracion
from src.tipos_vencimientos.models import TipoVencimiento
from src.vencimiento_personal.models import VencimientoPersonal
from src.configuracion_sistema.models import ConfiguracionSistema
from src.notificaciones.models import Notificacion

# Importamos la configuración validada por Pydantic
from src.config import settings

# Importamos configuracion de logger
from src.settings import ROOT_PATH
from src.logger import setup_logging
from src.lifespan import db_creation_lifespan

# Routers
from src.auth.router import router as auth_router
from src.personal.router import router as personal_router
from src.insumos.router import router as insumos_router
from src.equipos.router import router as equipos_router
from src.sector.router import router as sector_router
from src.plan_limpieza.router import router as plan_limpieza_router
from src.tarea.router import router as tarea_router
from src.tareas_ocurrencia.router import router as tareas_ocurrencia_router
from src.superficies.router import router as superficies_router
from src.insumo_quimico.router import router as insumo_quimico_router
from src.tipo_quimico.router import router as tipo_quimico_router
from src.elementosLimpieza.router import router as elementos_limpieza_router
from src.recambiosElementosLimpieza.router import router as recambios_elementos_limpieza_router
from src.consumo_producto.router import router as consumos_router
from src.planesCalibracion.router import router as planes_calibracion_router
from src.registrosCalibracion.router import router as registros_calibracion_router
from src.tipos_vencimientos.router import router as tipos_vencimientos_router
from src.vencimiento_personal.router import router as vencimiento_personal_router
from src.configuracion_sistema.router import router as configuracion_sistema_router
from src.notificaciones.router import router as notificaciones_router

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Asociamos los routers a nuestra app
app.include_router(auth_router)
app.include_router(personal_router)
app.include_router(insumos_router)
app.include_router(equipos_router)

app.include_router(sector_router)
app.include_router(plan_limpieza_router)
app.include_router(tarea_router)
app.include_router(tareas_ocurrencia_router)
app.include_router(superficies_router)
app.include_router(insumo_quimico_router)
app.include_router(tipo_quimico_router)
app.include_router(elementos_limpieza_router)
app.include_router(recambios_elementos_limpieza_router)
app.include_router(consumos_router)
app.include_router(planes_calibracion_router)
app.include_router(registros_calibracion_router)
app.include_router(tipos_vencimientos_router)
app.include_router(vencimiento_personal_router)
app.include_router(configuracion_sistema_router)
app.include_router(notificaciones_router)


