from datetime import date
from typing import TYPE_CHECKING
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Integer, CheckConstraint, Date
from src.tarea.constants import Frecuencia

if TYPE_CHECKING:
    from src.plan_limpieza.models import PlanLimpieza

val_frecuencias = ", ".join(str(f.value) for f in Frecuencia)


class Tarea(ModeloBase):
    __tablename__ = "tareas"
    __table_args__ = (
        CheckConstraint(
            f"frecuencia IN ({val_frecuencias})", 
            name="ck_tareas_frecuencia_valida"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(80), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(String(255), nullable=True)
    frecuencia: Mapped[int] = mapped_column(Integer, nullable=False)
    plan_limpieza_id: Mapped[int] = mapped_column(ForeignKey("planes_limpieza.id"), nullable=False)
    plan_limpieza: Mapped["PlanLimpieza"] = relationship(back_populates="tareas")
    
    # Para TareaOcurrencia
    ultima_generacion: Mapped[date | None] = mapped_column(Date, nullable=True)

    # ElementoLimpieza
    # elementos_limpieza: Mapped[list["ElementoLimpieza"]] = relationship(
    #     secondary="tarea_elemento_limpieza", back_populates="tareas"
    # )
