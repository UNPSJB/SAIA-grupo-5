from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
import enum

if TYPE_CHECKING:
    from src.producto.models import Producto

class EstadoLote(str, enum.Enum):
    EN_PRODUCCION = "En produccion"
    EMPAQUETANDO = "Empaquetando"
    TERMINADO = "Terminado"
    ENVIADO = "Enviado"

class LoteProduccion(ModeloBase):
    __tablename__ = "lotes_produccion"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False)
    producto: Mapped["Producto"] = relationship(back_populates="lotes_produccion")

    fecha_produccion: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_vencimiento: Mapped[date] = mapped_column(Date, nullable=False)
    cantidad_producida: Mapped[int] = mapped_column(Integer, nullable=False)

    estado: Mapped[str] = mapped_column(String, default=EstadoLote.EN_PRODUCCION.value, nullable=False)

    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)