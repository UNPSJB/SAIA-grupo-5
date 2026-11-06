from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase

if TYPE_CHECKING:
    from src.direcciones_cliente.models import DireccionCliente


class Cliente(ModeloBase):
    __tablename__ = "clientes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    razon_social: Mapped[str] = mapped_column(String(100), nullable=False)
    cuit: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    telefono: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    direcciones: Mapped[List["DireccionCliente"]] = relationship("DireccionCliente", back_populates="cliente")
    
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
