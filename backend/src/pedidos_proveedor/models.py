from datetime import date, datetime
from typing import TYPE_CHECKING
from sqlalchemy import Date, DateTime, Enum, Float, ForeignKey, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from src.pedidos_proveedor.constants import EstadoPedidoProveedor

if TYPE_CHECKING:
    from src.personal.models import Persona
    from src.proveedor.models import Proveedor
    from src.insumos.models import Insumo


class PedidoProveedor(ModeloBase):
    __tablename__ = "pedidos_proveedor"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    proveedor_id: Mapped[int] = mapped_column(ForeignKey("proveedor.id"), nullable=False, index=True)
    registrado_por_id: Mapped[int] = mapped_column(ForeignKey("personal.id"), nullable=False, index=True)

    fecha_pedido: Mapped[date] = mapped_column(Date, nullable=False, default=date.today, index=True)
    fecha_entrega_estimada: Mapped[date | None] = mapped_column(Date, nullable=True)
    observacion: Mapped[str | None] = mapped_column(String(500), nullable=True)

    estado: Mapped[EstadoPedidoProveedor] = mapped_column(Enum(EstadoPedidoProveedor), default=EstadoPedidoProveedor.PENDIENTE, nullable=False,)

    fecha_registro: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now)

    proveedor: Mapped["Proveedor"] = relationship()
    registrado_por: Mapped["Persona"] = relationship()
    items: Mapped[list["PedidoProveedorItem"]] = relationship(
        back_populates="pedido",
        cascade="all, delete-orphan",
    )

    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class PedidoProveedorItem(ModeloBase):
    __tablename__ = "pedidos_proveedor_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    pedido_id: Mapped[int] = mapped_column(ForeignKey("pedidos_proveedor.id", ondelete="CASCADE"), nullable=False, index=True)
    insumo_id: Mapped[int] = mapped_column(ForeignKey("insumos.id"), nullable=False, index=True)
    cantidad_pedida: Mapped[float] = mapped_column(Float, nullable=False)

    pedido: Mapped["PedidoProveedor"] = relationship(back_populates="items")
    insumo: Mapped["Insumo"] = relationship()