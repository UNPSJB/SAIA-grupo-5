from datetime import datetime
from typing import TYPE_CHECKING
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import DateTime, Float, ForeignKey, Index, UniqueConstraint
from src.receta.sellos import evaluar_sellos

if TYPE_CHECKING:
    from src.producto.models import Producto
    from src.etapa_receta.models import EtapaReceta
    from src.insumos.models import Insumo
    from src.unidad_medida.models import UnidadMedida


class Receta(ModeloBase):
    __tablename__ = "recetas"
    __table_args__ = (
        Index("ix_unica_receta_vigente_por_producto", "producto_id", unique=True),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False)
    producto: Mapped["Producto"] = relationship()

    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now)

    etapas: Mapped[list["EtapaReceta"]] = relationship(
        back_populates="receta",
        cascade="all, delete-orphan", # si se borra una receta se borran las etapas
        order_by="EtapaReceta.orden",
    )

    insumos: Mapped[list["InsumoReceta"]] = relationship(
        back_populates="receta",
        cascade="all, delete-orphan",
        order_by="InsumoReceta.id",
    )

    @property
    def sellos(self):
        return evaluar_sellos(self.producto, [(item.insumo, item.cantidad) for item in self.insumos])


class InsumoReceta(ModeloBase):
    __tablename__ = "insumos_receta"
    __table_args__ = (
        UniqueConstraint("receta_id", "insumo_id", name="uq_insumo_por_receta"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    receta_id: Mapped[int] = mapped_column(ForeignKey("recetas.id", ondelete="CASCADE"), nullable=False, index=True)
    receta: Mapped["Receta"] = relationship(back_populates="insumos")

    insumo_id: Mapped[int] = mapped_column(ForeignKey("insumos.id"), nullable=False)
    insumo: Mapped["Insumo"] = relationship()

    cantidad: Mapped[float] = mapped_column(Float, nullable=False)

    @property
    def nombre(self) -> str:
        return self.insumo.nombre

    @property
    def unidad_medida(self) -> "UnidadMedida":
        return self.insumo.unidad_medida
