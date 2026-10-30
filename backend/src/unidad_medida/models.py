from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean
from src.models import ModeloBase

class UnidadMedida(ModeloBase):
    __tablename__ = "unidades_medida"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(40), unique=True, index=True, nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)