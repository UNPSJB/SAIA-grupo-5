import json
from datetime import date
from typing import TYPE_CHECKING
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Integer, CheckConstraint, Date, Boolean, Enum
from sqlalchemy.types import TypeDecorator, Text
from src.tarea.constants import Frecuencia, Prioridad

if TYPE_CHECKING:
    from src.plan_limpieza.models import PlanLimpieza
    from src.sector.models import Sector
    from src.superficies.models import Superficie
    from src.equipos.models import Equipo
    from src.consumos_productos.models import ConsumoProducto

val_frecuencias = ", ".join(str(f.value) for f in Frecuencia)

def _valores_prioridad(enum_cls):
    return [elemento.value for elemento in enum_cls]

# guarda una lista de strings serializada como JSON
class ListaJSON(TypeDecorator):
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return json.loads(value)


class Tarea(ModeloBase):
    __tablename__ = "tareas"
    __table_args__ = (
        CheckConstraint(
            f"frecuencia IN ({val_frecuencias})",
            name="ck_tareas_frecuencia_valida"
        ),
        # La tarea es de un sector, de una superficie o de un equipo
        # nunca de ninguno, ni de más de uno a la vez.
        CheckConstraint(
            "(CASE WHEN sector_id IS NOT NULL THEN 1 ELSE 0 END + "
            "CASE WHEN superficie_id IS NOT NULL THEN 1 ELSE 0 END + "
            "CASE WHEN equipo_id IS NOT NULL THEN 1 ELSE 0 END) = 1",
            name="ck_tareas_exclusividad_relacion",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(80), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(String(500), nullable=True)
    frecuencia: Mapped[int] = mapped_column(Integer, nullable=False)
    prioridad: Mapped[Prioridad] = mapped_column(
        Enum(Prioridad, values_callable=_valores_prioridad),
        nullable=False,
        default=Prioridad.MEDIA,
    )
    foto_obligatoria: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    accion_correctiva: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Lista de pasos consecutivos
    procedimiento: Mapped[list[str] | None] = mapped_column(ListaJSON(), nullable=True)
    plan_limpieza_id: Mapped[int] = mapped_column(ForeignKey("planes_limpieza.id"), nullable=False)
    plan_limpieza: Mapped["PlanLimpieza"] = relationship(back_populates="tareas")
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    # Exactamente una de las tres debe tener valor (ver ck_tareas_exclusividad_relacion).
    sector_id: Mapped[int | None] = mapped_column(ForeignKey("sectores.id"), nullable=True)
    sector: Mapped["Sector | None"] = relationship(back_populates="tareas")
    superficie_id: Mapped[int | None] = mapped_column(ForeignKey("superficies.id"), nullable=True)
    superficie: Mapped["Superficie | None"] = relationship(back_populates="tareas")
    equipo_id: Mapped[int | None] = mapped_column(ForeignKey("equipos.id"), nullable=True)
    equipo: Mapped["Equipo | None"] = relationship(back_populates="tareas")

    # Para TareaOcurrencia
    ultima_generacion: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Para ConsumoProducto
    consumos_producto: Mapped[list["ConsumoProducto"]] = relationship(back_populates="tarea")
