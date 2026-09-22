from sqlalchemy import Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING 


if TYPE_CHECKING:
#    from src.tareas_ocurrencia.models import TareaOcurrencia
#    from src.insumo_quimico.models import InsumoQuimico
    from src.insumos.models import Insumo       #TODO: Borrar cuando este implementado

#TODO: Borrar cuando este implementado unidad_medida
from src.insumos.constants import UnidadMedida
from sqlalchemy import Enum
def _valores_unidad_medida(enum_cls):
    valores = []
    for elemento in enum_cls:
        valores.append(elemento.value)
    return valores

class ConsumoProducto(ModeloBase):
    __tablename__ = "consumos_producto"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    cantidad_aproximada: Mapped[float] = mapped_column(Float, nullable=False)
    estado: Mapped[bool] = mapped_column(Boolean, default=True)


    tarea_id: Mapped[int] = mapped_column(index=True)       #TODO: Borrar cuando este implementado
    insumo_quimico_id: Mapped[int] = mapped_column(ForeignKey("insumos.id"))      #TODO: Borrar cuando este implementado
    unidad_medida: Mapped[UnidadMedida] = mapped_column(            #TODO: Borrar cuando este implementado
            Enum(UnidadMedida, values_callable=_valores_unidad_medida),
            nullable=False,
        )

    insumo: Mapped["Insumo"] = relationship() #TODO: Borrar cuando este implementado

#DESCOMENTAR CUANDO ESTE IMPLEMENTADO
    #Clave foranea a la tarea
#    tarea_id: Mapped[int] = mapped_column(ForeignKey("tareas_ocurrencia.id"))

    #Clave foranea al insumo quimico
#    insumo_quimico_id: Mapped[int] = mapped_column(ForeignKey("insumos_quimicos.id"))

    #Clave foranea a la unidad de medida
#    unidad_medida_id: Mapped[int] = mapped_column(ForeignKey("unidad_medida.id"))

    #Relacion ORM para la navegacion con tareas_ocurrencia, insumos_quimicos y unidad de medida
#    tarea: Mapped["TareaOcurrencia"] = relationship(back_populates="consumos_producto")
#    insumo: Mapped["InsumoQuimico"] = relationship(back_populates="consumos_producto")
#    unidad: Mapped["UnidadMedida"] = relationship()

"""
    # revisar si es necesaria la bidereccionalidad

    # implementacion en tareas_ocurrencia
    #relacion ORM para navegacion (acceder a la lista de sus consumos)
    consumos_producto: Mapped[list["ConsumoProducto"]] = relationship(back_populates="tarea")

    # implementacion en insumo_quimico
    #relacion ORM para navegacion orientada a objetos (acceder a la lista de sus inscripciones/estudiantes)
    consumos_producto: Mapped[list["ConsumoProducto"]] = relationship(back_populates="insumo")
"""