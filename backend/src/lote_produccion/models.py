from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
import enum

if TYPE_CHECKING:
    from src.producto.models import Producto
    from src.insumos_lote.models import InsumoLote
    from src.envios_lote.models import EnvioLote
    from src.personal.models import Persona

class EstadoLote(str, enum.Enum):
    EN_PRODUCCION = "En produccion"
    EMPAQUETANDO = "Empaquetando"
    TERMINADO = "Terminado"
    PARCIALMENTE_DESPACHADO = "Parcialmente despachado"
    ENVIADO = "Enviado"

class LoteProduccion(ModeloBase):
    __tablename__ = "lotes_produccion"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False)
    producto: Mapped["Producto"] = relationship(back_populates="lotes_produccion")

    fecha_produccion: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_vencimiento: Mapped[date] = mapped_column(Date, nullable=False)
    cantidad_producida: Mapped[int] = mapped_column(Integer, nullable=False)

    estado: Mapped[str] = mapped_column(String, default=EstadoLote.EN_PRODUCCION.value, nullable=False)

    cantidad_disponible: Mapped[int] = mapped_column(Integer, nullable=False)

    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    insumos_utilizados: Mapped[list["InsumoUtilizado"]] = relationship(back_populates="lote_produccion")

    envios: Mapped[list["EnvioLote"]] = relationship(back_populates="lote")

    historial_estados: Mapped[list["HistorialEstadoLote"]] = relationship(cascade="all, delete-orphan", order_by="HistorialEstadoLote.fecha_hora.asc()")


class InsumoUtilizado(ModeloBase):
    __tablename__ = "insumos_utilizados"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    lote_produccion_id: Mapped[int] = mapped_column(ForeignKey("lotes_produccion.id"), nullable=False)
    insumo_lote_id: Mapped[int] = mapped_column(ForeignKey("insumos_lote.id"), nullable=False)
    cantidad_utilizada: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)

    lote_produccion: Mapped["LoteProduccion"] = relationship(back_populates="insumos_utilizados")
    insumo_lote: Mapped["InsumoLote"] = relationship(back_populates="producciones_asociadas")


class HistorialEstadoLote(ModeloBase):
    __tablename__ = "historial_estados_lote"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lote_id: Mapped[int] = mapped_column(Integer, ForeignKey("lotes_produccion.id"), nullable=False)
    estado: Mapped[str] = mapped_column(String(50), nullable=False)
    fecha_hora: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)
    usuario_id: Mapped[int] = mapped_column(Integer, ForeignKey("personal.id"), nullable=False)
    usuario: Mapped["Persona"] = relationship()
    observacion: Mapped[str | None] = mapped_column(String(200), nullable=True)

    lote: Mapped["LoteProduccion"] = relationship(back_populates="historial_estados")