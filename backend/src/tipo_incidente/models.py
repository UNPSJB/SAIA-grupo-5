from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean
from src.models import ModeloBase
from typing import List, TYPE_CHECKING 

if TYPE_CHECKING:
    from src.incidentes.models import Incidente

class TipoQuimico(ModeloBase):
    __tablename__ = "tipos_incidentes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    nombre: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    descripcion: Mapped[str] = mapped_column(String(400), nullable = True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    incidentes: Mapped[List["Incidente"]] = relationship(back_populates="tipo")

