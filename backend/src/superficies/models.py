from typing import TYPE_CHECKING
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, Table, Column, ForeignKey

if TYPE_CHECKING:
    from src.sector.models import Sector
    from src.tarea.models import Tarea

sector_superficie = Table(
    "sector_superficie",
    ModeloBase.metadata,
    Column("sector_id", ForeignKey("sectores.id"), primary_key=True),
    Column("superficie_id", ForeignKey("superficies.id"), primary_key=True),
)


class Superficie(ModeloBase):
    __tablename__ = "superficies"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(120), index=True, nullable=False, unique=True)
    # Puramente descriptivo, sin validación ni lógica asociada por ahora.
    tipo_contacto: Mapped[str] = mapped_column(String(20), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    sectores: Mapped[list["Sector"]] = relationship(
        secondary=sector_superficie, back_populates="superficies"
    )
    tareas: Mapped[list["Tarea"]] = relationship(back_populates="superficie")
