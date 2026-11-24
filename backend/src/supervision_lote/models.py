from datetime import date, datetime
from typing import Optional
from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from src.personal.models import Persona
from src.supervision_lote.constants import EstadoSupervisionOcurrencia


def _valores_estado(enum_cls):
    valores = []
    for elemento in enum_cls:
        valores.append(elemento.value)
    return valores


class SupervisionOcurrencia(ModeloBase):
    __tablename__ = "supervisiones_ocurrencia"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    lote_produccion_id: Mapped[int] = mapped_column(ForeignKey("lotes_produccion.id"), nullable=False, index=True)
    supervisor_id: Mapped[int | None] = mapped_column(ForeignKey("personal.id"), nullable=True)
    supervisor: Mapped[Optional["Persona"]] = relationship(lazy="joined")

    fase_lote_snap: Mapped[str] = mapped_column(String(40), nullable=False)
    receta_id_origen: Mapped[int | None] = mapped_column(Integer, nullable=True)
    receta_version_snap: Mapped[int | None] = mapped_column(Integer, nullable=True)
    etapa_id_origen: Mapped[int | None] = mapped_column(Integer, nullable=True)
    etapa_nombre_snap: Mapped[str] = mapped_column(String(80), nullable=False)
    etapa_orden_snap: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    paso_id_origen: Mapped[int | None] = mapped_column(Integer, nullable=True)
    paso_descripcion_snap: Mapped[str] = mapped_column(String(500), nullable=False)
    paso_orden_snap: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    producto_nombre_snap: Mapped[str] = mapped_column(String(80), nullable=False)
    cantidad_lote_snap: Mapped[str] = mapped_column(String(80), nullable=False)

    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_completado: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    fue_editada: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    fecha_edicion: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    observacion: Mapped[str | None] = mapped_column(String(500), nullable=True)

    estado: Mapped[EstadoSupervisionOcurrencia] = mapped_column(
        Enum(EstadoSupervisionOcurrencia, values_callable=_valores_estado),
        nullable=False,
        default=EstadoSupervisionOcurrencia.PENDIENTE,
    )
