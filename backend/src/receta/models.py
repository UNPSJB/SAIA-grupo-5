from datetime import datetime
from typing import TYPE_CHECKING
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import DateTime, ForeignKey, Index

if TYPE_CHECKING:
    from src.producto.models import Producto
    from src.etapa_receta.models import EtapaReceta


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

