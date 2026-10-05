from typing import TYPE_CHECKING, Optional
from datetime import date, datetime
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, ForeignKey, DateTime, Text, Index, text

if TYPE_CHECKING:
    from src.documentos.models import Documento
    from src.personal.models import Persona

class VersionDocumento(ModeloBase):
    __tablename__ = "versiones_documentos"
    __table_args__ = (
        Index(
            "ix_unica_version_vigente_por_documento",
            "documento_id",
            unique=True,
            sqlite_where=text("vigente = true")
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    version: Mapped[int] = mapped_column(index=True)
    vigente: Mapped[bool] = mapped_column(Boolean, default=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    documento_id: Mapped[int] = mapped_column(ForeignKey("documentos.id"), index=True, nullable=False)
    fecha_subida: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    archivo: Mapped[str] = mapped_column(Text, nullable=False)

    fecha_desde_vigencia: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    fecha_hasta_vigencia: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    documento: Mapped["Documento"] = relationship(back_populates="versiones")

    aprobador_id: Mapped[int | None] = mapped_column(ForeignKey("personal.id"), nullable=True)
    aprobador: Mapped[Optional["Persona"]] = relationship(lazy="joined")
    fecha_aprobacion: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
