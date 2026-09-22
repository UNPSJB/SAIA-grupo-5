from typing import TYPE_CHECKING
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, Table, Column, ForeignKey

if TYPE_CHECKING:
    from src.sector.models import Sector
    from src.tarea.models import Tarea
    from src.equipos.models import Equipo
    from src.superficies.models import Superficie

sector_plan_limpieza = Table(
    "sector_plan_limpieza",
    ModeloBase.metadata,
    Column("sector_id", ForeignKey("sectores.id"), primary_key=True),
    Column("plan_limpieza_id", ForeignKey("planes_limpieza.id"), primary_key=True),
)


class PlanLimpieza(ModeloBase):
    __tablename__ = "planes_limpieza"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(60), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(String(500), nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    sectores: Mapped[list["Sector"]] = relationship(
        secondary=sector_plan_limpieza, back_populates="planes"
    )
    tareas: Mapped[list["Tarea"]] = relationship(back_populates="plan_limpieza")
    equipos: Mapped[list["Equipo"]] = relationship(back_populates="plan_limpieza")
    superficies: Mapped[list["Superficie"]] = relationship(
        secondary="superficie_plan_limpieza", back_populates="planes"
    )
