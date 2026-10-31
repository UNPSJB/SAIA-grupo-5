from src.models import ModeloBase
from datetime import date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, Integer, ForeignKey, Text, Date
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.unidad_medida.models import UnidadMedida
    from src.receta.models import Receta


class Producto(ModeloBase):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    nombre: Mapped[str] = mapped_column(String(40), index=True)
    descripcion: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cantidad_neta: Mapped[int] = mapped_column(Integer, nullable=False)

    unidad_medida_id: Mapped[int] = mapped_column(ForeignKey("unidades_medida.id"), nullable=False)
    unidad_medida: Mapped["UnidadMedida"] = relationship()

    foto_producto: Mapped[str | None] = mapped_column(Text, nullable=True)
    fecha_lanzamiento: Mapped[date] = mapped_column(Date, nullable=False)

    #lotes_produccion_id: Mapped[list[int]]
    #lotes_produccion: Mapped[list["LotesProduccion"]] = mappedColumn

    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    receta: Mapped["Receta | None"] = relationship(viewonly=True, uselist=False)
