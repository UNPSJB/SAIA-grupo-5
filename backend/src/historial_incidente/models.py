from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String
from src.models import ModeloBase

if TYPE_CHECKING:
    from src.incidentes.models import Incidente
    from src.accion_correctiva.models import AccionCorrectiva


class HistorialIncidente(ModeloBase):
    __tablename__ = "historial_incidente"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    incidente_id: Mapped[int] = mapped_column(ForeignKey("incidentes.id"), nullable=False, index=True)
    tipo_evento: Mapped[str] = mapped_column(String(20), nullable=False)  # "CREADO" | "CERRADO" | "REABIERTO"
    fecha_evento: Mapped[datetime] = mapped_column(nullable=False, default=datetime.now)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("personal.id"), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(String(500), nullable=True)
    accion_correctiva_id: Mapped[int | None] = mapped_column(ForeignKey("acciones_correctivas.id"), nullable=True)

    incidente: Mapped["Incidente"] = relationship(back_populates="historial")
    accion_correctiva: Mapped["AccionCorrectiva | None"] = relationship()
