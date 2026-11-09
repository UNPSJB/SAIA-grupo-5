from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Date, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase

if TYPE_CHECKING:
    from src.lote_proveedor.models import LoteProveedor


class Proveedor(ModeloBase):
    __tablename__ = "proveedor"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    nombre: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    cuit: Mapped[str] = mapped_column(String(20), nullable=False, unique=True, index=True)
    telefono: Mapped[str | None] = mapped_column(String(40), nullable=True)
    email: Mapped[str | None] = mapped_column(String(254), nullable=True)


    numero_habilitacion: Mapped[str | None] = mapped_column(String(100), nullable=True)
    vencimiento_habilitacion: Mapped[date | None] = mapped_column(Date, nullable=True)
    observacion_habilitacion: Mapped[str | None] = mapped_column(String(500), nullable=True)
    archivo_adjunto: Mapped[str | None] = mapped_column(Text, nullable=True)

    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    lotes: Mapped[list["LoteProveedor"]] = relationship(
        back_populates="proveedor",
        cascade="all, delete-orphan",
    )