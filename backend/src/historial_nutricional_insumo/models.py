from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Integer, DateTime
from datetime import datetime
from typing import TYPE_CHECKING
from src.models import ModeloBase

if TYPE_CHECKING:
    from src.personal.models import Persona
    from src.informacion_nutricional_insumo.models import InformacionNutricionalInsumo

class HistorialNutricionalInsumo(ModeloBase):
    __tablename__ = "historial_nutricional_insumos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    info_nutricional_id: Mapped[int] = mapped_column(Integer, ForeignKey("informacion_nutricional_insumos.id"), nullable=False, index=True)
    dato_modificado: Mapped[str] = mapped_column(String(50), nullable=False)
    valor_anterior: Mapped[str | None] = mapped_column(String(50), nullable=True)
    valor_nuevo: Mapped[str | None] = mapped_column(String(50), nullable=True)
    motivo: Mapped[str | None] = mapped_column(String(500), nullable=True)

    modificada_por_id: Mapped[int] = mapped_column(Integer, ForeignKey("personal.id"), nullable=False)
    fecha_modificacion: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    info_nutricional: Mapped["InformacionNutricionalInsumo"] = relationship(back_populates="historial_cambios")
    modificada_por: Mapped["Persona"] = relationship()

