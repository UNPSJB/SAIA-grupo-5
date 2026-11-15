from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean
from src.models import ModeloBase


class Aditivo(ModeloBase):
    __tablename__ = "aditivos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    clase_funcional: Mapped[str] = mapped_column(String(40), index=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    numero_ins: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
