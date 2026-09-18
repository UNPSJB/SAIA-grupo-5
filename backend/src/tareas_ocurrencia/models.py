from datetime import date
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Date, Enum
from src.tareas_ocurrencia.constants import EstadoTareaOcurrencia


def _valores_estado(enum_cls):
    valores = []
    for elemento in enum_cls:
        valores.append(elemento.value)
    return valores


class TareaOcurrencia(ModeloBase):
    __tablename__ = "tareas_ocurrencia"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    operario_id: Mapped[int | None] = mapped_column(nullable=True)

    # NO relationship() a propósito, para no romper el desacople del
    # historial si la Tarea se edita o se borra después.
    # Sirven para poder generar el checklist diario. 
    tarea_id_origen: Mapped[int | None] = mapped_column(nullable=True)
    plan_id_origen: Mapped[int | None] = mapped_column(nullable=True)

    # Snapshot: copia de los datos de Tarea/PlanLimpieza al momento de generar
    tarea_nombre_snap: Mapped[str] = mapped_column(String(80), nullable=False)
    tarea_descripcion_snap: Mapped[str | None] = mapped_column(String(255), nullable=True)
    frecuencia_snap: Mapped[str] = mapped_column(String(20), nullable=False)
    plan_nombre_snap: Mapped[str] = mapped_column(String(60), nullable=False)

    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_completado: Mapped[date | None] = mapped_column(Date, nullable=True)

    estado: Mapped[EstadoTareaOcurrencia] = mapped_column(
        Enum(EstadoTareaOcurrencia, values_callable=_valores_estado),
        nullable=False,
        default=EstadoTareaOcurrencia.PENDIENTE,
    )
