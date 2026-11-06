from datetime import date
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase


class PlanCalibracion(ModeloBase):
    __tablename__ = "planes_calibracion"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    equipo_id: Mapped[int] = mapped_column(ForeignKey("equipos.id"), nullable=False, unique=True)
    fecha_inicio: Mapped[date] = mapped_column(nullable=False)
    periodicidad: Mapped[int] = mapped_column(nullable=False)
    estado: Mapped[bool] = mapped_column(default=True, nullable=False)

    equipo: Mapped["Equipo"] = relationship(back_populates="plan_calibracion")
    registros_calibracion: Mapped[list["RegistroCalibracion"]] = relationship(back_populates="plan_calibracion")