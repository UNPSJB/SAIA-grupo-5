from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from src.models import ModeloBase


class Cliente(ModeloBase):
    __tablename__ = "clientes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    dni: Mapped[int] = mapped_column(index=True)
    nombre: Mapped[str] = mapped_column(String(100), index=True)
    apellido: Mapped[str] = mapped_column(String(100), index=True)
    email: Mapped[str] = mapped_column(String(100))
    telefono: Mapped[str] = mapped_column(String(30))
    activo: Mapped[bool] = mapped_column(default=True)