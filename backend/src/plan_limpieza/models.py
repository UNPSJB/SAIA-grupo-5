from typing import TYPE_CHECKING
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey

if TYPE_CHECKING:
    from src.sector.models import Sector


class PlanLimpieza(ModeloBase):
    __tablename__ = "planes_limpieza"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(60))
    descripcion: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sector_id: Mapped[int] = mapped_column(ForeignKey("sectores.id"))
    sector: Mapped["Sector"] = relationship(back_populates="planes")