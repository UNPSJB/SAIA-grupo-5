from typing import TYPE_CHECKING
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean

if TYPE_CHECKING:
    from src.tarea.models import Tarea


class PlanLimpieza(ModeloBase):
    __tablename__ = "planes_limpieza"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(60), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(String(500), nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    tareas: Mapped[list["Tarea"]] = relationship(back_populates="plan_limpieza")
