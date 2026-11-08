from datetime import date, datetime
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from src.lote_proveedor.constants import EstadoLoteProveedor

if TYPE_CHECKING:
    from src.personal.models import Persona
    from src.proveedor.models import Proveedor


class LoteProveedor(ModeloBase):
    __tablename__ = "lotes_proveedor"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    proveedor_id: Mapped[int] = mapped_column(ForeignKey("proveedor.id"), nullable=False, index=True)
    registrado_por_id: Mapped[int] = mapped_column(ForeignKey("personal.id"), nullable=False, index=True)

    numero_lote: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    numero_remito: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    fecha_recepcion: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    estado: Mapped[EstadoLoteProveedor] = mapped_column(
        Enum(EstadoLoteProveedor),
        default=EstadoLoteProveedor.LLEGADA,
        nullable=False,
    )

    observaciones: Mapped[str | None] = mapped_column(String(500), nullable=True)
    archivo_adjunto: Mapped[str | None] = mapped_column(Text, nullable=True)

    fecha_registro: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    proveedor: Mapped["Proveedor"] = relationship(back_populates="lotes")
    registrado_por: Mapped["Persona"] = relationship()