from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, DateTime, Boolean
from src.models import ModeloBase

if TYPE_CHECKING:
    from src.incidentes.models import Incidente
    from src.personal.models import Persona

class AccionCorrectiva(ModeloBase):
    __tablename__ = "acciones_correctivas"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    descripcion: Mapped[str] = mapped_column(String(500), nullable=False)
    fecha: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    incidente_id: Mapped[int] = mapped_column(ForeignKey("incidentes.id"), index=True, nullable=False)
    persona_id: Mapped[int] = mapped_column(ForeignKey("personal.id"), nullable=False)

    incidente: Mapped["Incidente"] = relationship(back_populates="acciones_correctivas")
    persona: Mapped["Persona"] = relationship()
