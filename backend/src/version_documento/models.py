from typing import TYPE_CHECKING
from datetime import date, datetime
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, ForeignKey, DateTime, Text

if TYPE_CHECKING:
    from src.documentos.models import Documento

class VersionDocumento(ModeloBase):
    __tablename__ = "versiones_documentos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    version: Mapped[int] = mapped_column(index=True)
    vigente: Mapped[bool] = mapped_column(Boolean, default=True)
    #activo: Mapped[bool] = mapped_column(Boolean, default=True)
    documento_id: Mapped[int] = mapped_column(ForeignKey("documentos.id"), index=True, nullable=False)
    fecha_subida: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    archivo: Mapped[str] = mapped_column(Text, nullable=False)

    fecha_desde_vigencia: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    fecha_hasta_vigencia: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    documento: Mapped["Documento"] = relationship(back_populates="versiones")
