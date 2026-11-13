from datetime import datetime
from typing import TYPE_CHECKING
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer, String, UniqueConstraint, text
from src.receta.constants import TipoRenglon
from src.receta.sellos import evaluar_sellos

if TYPE_CHECKING:
    from src.producto.models import Producto
    from src.etapa_receta.models import EtapaReceta
    from src.insumos.models import Insumo
    from src.unidad_medida.models import UnidadMedida
    from src.aditivo.models import Aditivo


class Receta(ModeloBase):
    __tablename__ = "recetas"
    __table_args__ = (
        Index(
            "ix_unica_receta_vigente_por_producto",
            "producto_id",
            unique=True,
            sqlite_where=text("vigente = 1"),
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False, index=True)
    producto: Mapped["Producto"] = relationship()

    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    vigente: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now)
    fecha_desde_vigencia: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    fecha_hasta_vigencia: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    rendimiento: Mapped[float | None] = mapped_column(Float, nullable=True)
    rendimiento_unidad_medida_id: Mapped[int | None] = mapped_column(ForeignKey("unidades_medida.id"), nullable=True)
    rendimiento_unidad_medida: Mapped["UnidadMedida | None"] = relationship(foreign_keys=[rendimiento_unidad_medida_id])

    porcion: Mapped[float | None] = mapped_column(Float, nullable=True)
    porcion_unidad_medida_id: Mapped[int | None] = mapped_column(ForeignKey("unidades_medida.id"), nullable=True)
    porcion_unidad_medida: Mapped["UnidadMedida | None"] = relationship(foreign_keys=[porcion_unidad_medida_id])

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
        return evaluar_sellos(
            self.producto,
            [(item.insumo, item.cantidad) for item in self.insumos],
            self.rendimiento,
            self.rendimiento_unidad_medida,
        )


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

    tipo: Mapped[str] = mapped_column(String(20), nullable=False, default=TipoRenglon.INGREDIENTE.value)
    aditivo_id: Mapped[int | None] = mapped_column(ForeignKey("aditivos.id"), nullable=True)
    aditivo: Mapped["Aditivo | None"] = relationship()

    cantidad: Mapped[float] = mapped_column(Float, nullable=False)

    @property
    def nombre(self) -> str:
        return self.insumo.nombre

    @property
    def unidad_medida(self) -> "UnidadMedida":
        return self.insumo.unidad_medida
