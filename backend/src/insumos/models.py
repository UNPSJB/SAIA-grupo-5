from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String

class Insumo(ModeloBase):
    __tablename__ = "insumos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(40), index=True, nullable=False)     # Le pongo nullable para que la base de datos no acepte valores nulos
    unidad_medida: Mapped[str] = mapped_column(String(20), nullable=False)

