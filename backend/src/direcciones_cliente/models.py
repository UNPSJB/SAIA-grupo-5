from typing import Optional, TYPE_CHECKING
from sqlalchemy import Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase

if TYPE_CHECKING:
    from src.clientes.models import Cliente


class DireccionCliente(ModeloBase):
    __tablename__ = "direcciones_cliente"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    cliente_id: Mapped[int] = mapped_column(ForeignKey("clientes.id"), nullable=False)
    calle_altura: Mapped[str] = mapped_column(String(150), nullable=False)
    localidad: Mapped[str] = mapped_column(String(100), nullable=False)
    provincia: Mapped[str] = mapped_column(String(100), nullable=False)
    codigo_postal: Mapped[str] = mapped_column(String(20), nullable=False)
    descripcion: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    cliente: Mapped["Cliente"] = relationship("Cliente", back_populates="direcciones")