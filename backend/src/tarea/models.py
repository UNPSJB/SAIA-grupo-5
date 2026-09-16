from typing import TYPE_CHECKING
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey

if TYPE_CHECKING:
    from src.plan_limpieza.models import PlanLimpieza


class Tarea(ModeloBase):
    __tablename__ = "tareas"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(80), nullable=False)
    plan_limpieza_id: Mapped[int] = mapped_column(ForeignKey("planes_limpieza.id"), nullable=False)
    plan_limpieza: Mapped["PlanLimpieza"] = relationship(back_populates="tareas")
