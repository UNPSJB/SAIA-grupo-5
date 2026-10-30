from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, ForeignKey
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.unidad_medida.models import UnidadMedida

class Insumo(ModeloBase):
    __tablename__ = "insumos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(40), index=True, nullable=False)     # Le pongo nullable para que la base de datos no acepte valores nulos
    
    unidad_medida_id: Mapped[int] = mapped_column(ForeignKey("unidades_medida.id"), nullable=False)
    unidad_medida: Mapped["UnidadMedida"] = relationship()

    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    tipo_herencia: Mapped[str] = mapped_column(String(30))

    __mapper_args__ = {
        "polymorphic_on" : "tipo_herencia",         # Le dice a SQLAlchemy que la columna tipo_herencia es el discriminador para saber si es un insumo normal o quimico
        "polymorphic_identity" : "general"      # Sirve para que cuando se cree un insumo normal (no quimico) en el campo de tipo_herencia se guarde "general"
    }


