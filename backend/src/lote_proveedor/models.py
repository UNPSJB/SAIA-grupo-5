from datetime import date, datetime
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from src.lote_proveedor.constants import EstadoLoteProveedor

if TYPE_CHECKING:
    from src.personal.models import Persona
    from src.proveedor.models import Proveedor
    from src.insumos_lote.models import InsumoLote


class LoteProveedor(ModeloBase):
    __tablename__ = "lotes_proveedor"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    proveedor_id: Mapped[int] = mapped_column(ForeignKey("proveedor.id"), nullable=False, index=True)
    registrado_por_id: Mapped[int] = mapped_column(ForeignKey("personal.id"), nullable=False, index=True)

    numero_lote: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    numero_remito: Mapped[str | None] = mapped_column(String(100), nullable=False, index=True)
    fecha_recepcion: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    estado: Mapped[EstadoLoteProveedor] = mapped_column(
        Enum(EstadoLoteProveedor),
        default=EstadoLoteProveedor.LLEGADA,
        nullable=False,
    )

    insumos: Mapped[list["InsumoLote"]] = relationship(
        back_populates="lote_proveedor",
        cascade="all, delete-orphan",
    )

    archivo_adjunto: Mapped[str | None] = mapped_column(Text, nullable=True)

    fecha_registro: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    proveedor: Mapped["Proveedor"] = relationship(back_populates="lotes")
    registrado_por: Mapped["Persona"] = relationship()

    historial_estados: Mapped[list["HistorialEstadoLoteProveedor"]] = relationship(
        cascade="all, delete-orphan", 
        order_by="HistorialEstadoLoteProveedor.fecha_hora.asc()"
    )

class HistorialEstadoLoteProveedor(ModeloBase):
    __tablename__ = "historial_estados_lote_proveedor"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lote_id: Mapped[int] = mapped_column(Integer, ForeignKey("lotes_proveedor.id"), nullable=False)
    estado: Mapped[str] = mapped_column(String(50), nullable=False)
    fecha_hora: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)
    usuario_id: Mapped[int] = mapped_column(Integer, ForeignKey("personal.id"), nullable=False)
    observacion: Mapped[str | None] = mapped_column(String(200), nullable=True)

    usuario: Mapped["Persona"] = relationship()
    lote: Mapped["LoteProveedor"] = relationship(back_populates="historial_estados")