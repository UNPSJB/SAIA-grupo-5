from datetime import date, datetime
from typing import Optional
from sqlalchemy import Date, DateTime, Boolean, ForeignKey, String, Text
from sqlalchemy.orm import mapped_column, Mapped, relationship
from src.models import ModeloBase
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.personal.models import Persona
    from src.tipos_vencimientos.models import TipoVencimiento


class VencimientoPersonal(ModeloBase):
    __tablename__ = "vencimiento_personal"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    persona_id: Mapped[int] = mapped_column(ForeignKey("personal.id"), nullable=False, index=True)
    tipo_vencimiento_id: Mapped[int] = mapped_column(ForeignKey("tipos_vencimientos.id"), nullable=False, index=True)

    fecha_desde: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_hasta: Mapped[date] = mapped_column(Date, nullable=False)
    observacion: Mapped[str | None] = mapped_column(String(500), nullable=True)

    archivo_adjunto: Mapped[str | None] = mapped_column(Text, nullable=True)

    fecha_carga: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now)
    es_actual: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    persona: Mapped["Persona"] = relationship(back_populates="vencimientos")
    tipo_vencimiento: Mapped["TipoVencimiento"] = relationship(back_populates="vencimientos")

    @property
    def dias_restantes(self) -> int:
        return (self.fecha_hasta - date.today()).days