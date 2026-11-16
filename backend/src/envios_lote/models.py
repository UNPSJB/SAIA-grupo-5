from datetime import datetime, date
from typing import Optional, TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
import enum

if TYPE_CHECKING:
    from src.lote_produccion.models import LoteProduccion
    from src.clientes.models import Cliente
    from src.direcciones_cliente.models import DireccionCliente


class EstadoEnvio(str, enum.Enum):
    EN_CAMINO = "En camino"
    ENTREGADO = "Entregado"
    RECHAZADO = "Rechazado"


class EnvioLote(ModeloBase):
    __tablename__ = "envios_lote"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    lote_id: Mapped[int] = mapped_column(ForeignKey("lotes_produccion.id"), nullable=False)
    cliente_id: Mapped[int] = mapped_column(ForeignKey("clientes.id"), nullable=False)
    direccion_cliente_id: Mapped[int] = mapped_column(ForeignKey("direcciones_cliente.id"), nullable=False)

    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    numero_remito: Mapped[str] = mapped_column(String(50), nullable=False)
    transportista: Mapped[str] = mapped_column(String(100), nullable=False)

    estado: Mapped[str] = mapped_column(String(30), default=EstadoEnvio.EN_CAMINO.value, nullable=False)
    fecha_envio: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_entrega: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    observaciones: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    lote: Mapped["LoteProduccion"] = relationship(back_populates="envios")
    cliente: Mapped["Cliente"] = relationship()
    direccion: Mapped["DireccionCliente"] = relationship()