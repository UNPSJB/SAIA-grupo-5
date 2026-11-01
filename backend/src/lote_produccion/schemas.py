from datetime import date
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field
from src.producto.schemas import Producto

class EstadisticaProduccion(BaseModel):
    producto_id: int
    producto_nombre: str
    fecha: date
    cantidad: int