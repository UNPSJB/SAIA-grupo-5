from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.vencimiento_personal.models import VencimientoPersonal


class TipoVencimiento(ModeloBase):
    __tablename__ = "tipos_vencimientos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    nombre: Mapped[str] = mapped_column(String(40), index=True)
    descripcion: Mapped[str | None] = mapped_column(String(500), nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    vencimientos: Mapped[list["VencimientoPersonal"]] = relationship(back_populates = "tipo_vencimiento")

