from typing import TYPE_CHECKING
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean

if TYPE_CHECKING:
    from src.equipos.models import Equipo
    from src.plan_limpieza.models import PlanLimpieza
    from src.superficies.models import Superficie

class Sector(ModeloBase):
    __tablename__ = "sectores"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(40), index=True, nullable=False, unique=True)
    equipos: Mapped[list["Equipo"]] = relationship(back_populates="sector")
    planes: Mapped[list["PlanLimpieza"]] = relationship(
        secondary="sector_plan_limpieza", back_populates="sectores"
    )
    superficies: Mapped[list["Superficie"]] = relationship(
        secondary="sector_superficie", back_populates="sectores"
    )
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    
