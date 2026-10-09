from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, Boolean, DateTime, Enum, Text
from src.incidentes.constants import EstadoIncidente
from src.models import ModeloBase
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.tipo_incidente.models import TipoIncidente
    from src.personal.models import Persona
    from src.sector.models import Sector

def _valores_estado(enum_cls):
    valores = []
    for elemento in enum_cls:
        valores.append(elemento.value)
    return valores

class Incidente(ModeloBase):
    __tablename__ = "incidentes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(60), unique=True, index=True, nullable=False)
    descripcion: Mapped[str] = mapped_column(String(500))
    fecha_abierto: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    fecha_cierre: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    foto_opcional: Mapped[str | None] = mapped_column(Text, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    estado: Mapped[EstadoIncidente] = mapped_column(
                Enum(EstadoIncidente, values_callable=_valores_estado),
                nullable=False,
                default=EstadoIncidente.ABIERTO,
    )
    
    tipo_id: Mapped[int] = mapped_column(ForeignKey("tipos_incidentes.id"), index=True, nullable=False)
    operario_id: Mapped[int] = mapped_column(ForeignKey("personal.id"), nullable=False)
    sector_id: Mapped[int | None] = mapped_column(ForeignKey("sectores.id"), nullable=True)

    tipo: Mapped["TipoIncidente"] = relationship(back_populates="incidentes")
    operario: Mapped["Persona"] = relationship()   
    sector: Mapped["Sector | None"] = relationship()
