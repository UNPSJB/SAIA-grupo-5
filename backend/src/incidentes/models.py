from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.incidentes.constants import EstadoIncidente
from src.models import ModeloBase

if TYPE_CHECKING:
    from src.tipo_incidente.models import TipoIncidente
    from src.personal.models import Persona
    from src.sector.models import Sector
    from src.accion_correctiva.models import AccionCorrectiva
    from src.historial_incidente.models import HistorialIncidente


def _valores_estado(enum_cls):
    return [estado.value for estado in enum_cls]


class Incidente(ModeloBase):
    __tablename__ = "incidentes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(60), unique=True, index=True, nullable=False)
    descripcion: Mapped[str] = mapped_column(String(500), nullable=False)
    fecha_abierto: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    fecha_cierre: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    foto_opcional: Mapped[str | None] = mapped_column(Text, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    estado: Mapped[EstadoIncidente] = mapped_column(
        Enum(EstadoIncidente, values_callable=_valores_estado),
        nullable=False,
        default=EstadoIncidente.ABIERTO,
    )

    tipo_id: Mapped[int] = mapped_column(ForeignKey("tipos_incidentes.id"), index=True, nullable=False)
    operario_id: Mapped[int | None] = mapped_column(ForeignKey("personal.id"), nullable=True)
    sector_id: Mapped[int | None] = mapped_column(ForeignKey("sectores.id"), nullable=True)

    tipo: Mapped["TipoIncidente"] = relationship(back_populates="incidentes")
    operario: Mapped["Persona"] = relationship()
    sector: Mapped["Sector | None"] = relationship()
    acciones_correctivas: Mapped[list["AccionCorrectiva"]] = relationship(back_populates="incidente")
    historial: Mapped[list["HistorialIncidente"]] = relationship(back_populates="incidente")
