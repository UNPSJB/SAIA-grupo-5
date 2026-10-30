from sqlalchemy import Float, Boolean, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from typing import TYPE_CHECKING 
from src.insumo_quimico.models import InsumoQuimico



if TYPE_CHECKING:
    from src.tarea.models import Tarea
    from src.unidad_medida.models import UnidadMedida


class ConsumoProducto(ModeloBase):
    __tablename__ = "consumos_producto"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    cantidad_aproximada: Mapped[float] = mapped_column(Float, nullable=False)
    estado: Mapped[bool] = mapped_column(Boolean, default=True)

    unidad_medida_id: Mapped[int] = mapped_column(ForeignKey("unidades_medida.id"), nullable=False)

    #Clave foranea a la tarea
    tarea_id: Mapped[int] = mapped_column(ForeignKey("tareas.id"), index=True, nullable=False)

    #Clave foranea al insumo quimico
    insumo_quimico_id: Mapped[int] = mapped_column(ForeignKey("insumos_quimicos.id"), nullable=False)

    #Relacion ORM para la navegacion con tarea, insumo_quimico
    tarea: Mapped["Tarea"] = relationship(back_populates="consumos_producto")
    insumo: Mapped["InsumoQuimico"] = relationship()
    unidad_medida: Mapped["UnidadMedida"] = relationship()