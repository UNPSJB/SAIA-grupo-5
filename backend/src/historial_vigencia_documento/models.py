from typing import TYPE_CHECKING
from datetime import datetime
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, DateTime

if TYPE_CHECKING:
    from src.personal.models import Persona


class HistorialVigencia(ModeloBase):
    __tablename__ = "historiales_vigencia"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    documento_id: Mapped[int] = mapped_column(ForeignKey("documentos.id"), index=True, nullable=False)

    version_anterior_id: Mapped[int | None] = mapped_column(ForeignKey("versiones_documentos.id"), nullable=True)
    version_nueva_id: Mapped[int] = mapped_column(ForeignKey("versiones_documentos.id"), nullable=False)

    persona_id: Mapped[int] = mapped_column(ForeignKey("personal.id"), nullable=False)
    persona: Mapped["Persona"] = relationship(lazy="joined")
    fecha_hora: Mapped[datetime] = mapped_column(DateTime, nullable=False)