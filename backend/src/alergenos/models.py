from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, ForeignKey
from src.models import ModeloBase
from typing import List, TYPE_CHECKING 

if TYPE_CHECKING:
    from src.insumos.models import Insumo

class Alergeno(ModeloBase):
    __tablename__ = "alergenos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(String(500), nullable=True)
    es_tacc: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class InsumoAlergeno(ModeloBase):
    __tablename__ = "insumo_alergenos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    insumo_id: Mapped[int] = mapped_column(ForeignKey("insumos.id"), nullable=False, index=True)
    alergeno_id: Mapped[int] = mapped_column(ForeignKey("alergenos.id"), nullable=False, index=True)
    es_derivado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    insumo: Mapped["Insumo"] = relationship(back_populates="alergenos")
    alergeno: Mapped["Alergeno"] = relationship()
