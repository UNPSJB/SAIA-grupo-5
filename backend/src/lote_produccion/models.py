from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
import enum

if TYPE_CHECKING:
    from src.producto.models import Producto
    from src.insumos.models import Insumo

class EstadoLote(str, enum.Enum):
    EN_PRODUCCION = "En produccion"
    EMPAQUETANDO = "Empaquetando"
    TERMINADO = "Terminado"
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

    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    insumos_utilizados: Mapped[list["InsumoUtilizado"]] = relationship(back_populates="lote_produccion")


class InsumoUtilizado(ModeloBase):
    __tablename__ = "insumos_utilizados"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    lote_produccion_id: Mapped[int] = mapped_column(ForeignKey("lotes_produccion.id"), nullable=False)
    insumo_id: Mapped[int] = mapped_column(ForeignKey("insumos.id"), nullable=False)
    cantidad_utilizada: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)

    lote_produccion: Mapped["LoteProduccion"] = relationship(back_populates="insumos_utilizados")
    insumo: Mapped["Insumo"] = relationship()