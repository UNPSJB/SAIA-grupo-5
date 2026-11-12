from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase

if TYPE_CHECKING:
    from src.insumos.models import Insumo
    from src.lote_proveedor.models import LoteProveedor
    from src.lote_produccion.models import InsumoUtilizado


class InsumoLote(ModeloBase):
    __tablename__ = "insumos_lote"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    lote_proveedor_id: Mapped[int] = mapped_column(Integer, ForeignKey("lotes_proveedor.id"), nullable=False, index=True)
    insumo_id: Mapped[int] = mapped_column(Integer, ForeignKey("insumos.id"), nullable=False, index=True)

    marca: Mapped[str] = mapped_column(String(100), nullable=False)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    cantidad_restante: Mapped[int] = mapped_column(Integer, nullable=False)
    fecha_vencimiento: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    costo_unitario: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    minimo_alerta: Mapped[int | None] = mapped_column(Integer, nullable=False)


    lote_proveedor: Mapped["LoteProveedor"] = relationship(back_populates="insumos")
    insumo: Mapped["Insumo"] = relationship()

    producciones_asociadas: Mapped[list["InsumoUtilizado"]] = relationship(back_populates="insumo_lote")
    
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)