from datetime import date
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase


class RegistroCalibracion(ModeloBase):
    __tablename__ = "registros_calibracion"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    plan_calibracion_id: Mapped[int] = mapped_column(ForeignKey("planes_calibracion.id"), nullable=False)
    fecha: Mapped[date] = mapped_column(nullable=False)
    observacion: Mapped[str | None] = mapped_column(String(255))

    plan_calibracion: Mapped["PlanCalibracion"] = relationship(back_populates="registros_calibracion")