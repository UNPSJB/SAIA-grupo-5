from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Enum
from src.insumos.constants import UnidadMedida

def _valores_unidad_medida(enum_cls):
    valores = []
    for elemento in enum_cls:
        valores.append(elemento.value)
    return valores

class Insumo(ModeloBase):
    __tablename__ = "insumos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(40), index=True, nullable=False)     # Le pongo nullable para que la base de datos no acepte valores nulos
    unidad_medida: Mapped[UnidadMedida] = mapped_column(
        Enum(UnidadMedida, values_callable=_valores_unidad_medida),
        nullable=False,
    )


