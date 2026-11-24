from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase

if TYPE_CHECKING:
    from src.equipos.models import Equipo
    from src.personal.models import Persona


class RegistroTemperatura(ModeloBase):
    __tablename__ = "registros_temperatura"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    equipo_id: Mapped[int] = mapped_column(Integer, ForeignKey("equipos.id"), nullable=False, index=True)
    operario_id: Mapped[int] = mapped_column(Integer, ForeignKey("personal.id"), nullable=False)

    temperatura_registrada: Mapped[float] = mapped_column(Float, nullable=False)
    fecha_hora_registro: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)

    fuera_de_rango: Mapped[bool] = mapped_column(Boolean, nullable=False)
    accion_tomada: Mapped[str | None] = mapped_column(String(500), nullable=True)

    equipo: Mapped["Equipo"] = relationship()
    operario: Mapped["Persona"] = relationship()
