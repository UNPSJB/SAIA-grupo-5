from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean
from src.models import ModeloBase
from typing import List, TYPE_CHECKING 

if TYPE_CHECKING:
    from src.insumo_quimico.models import InsumoQuimico

class TipoQuimico(ModeloBase):
    __tablename__ = "tipos_quimicos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    nombre: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    insumos_quimicos: Mapped[List["InsumoQuimico"]] = relationship("InsumoQuimico", back_populates="tipo")