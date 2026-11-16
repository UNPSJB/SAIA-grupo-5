from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, ForeignKey, Float
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

    valor_energetico: Mapped[float | None] = mapped_column(Float, nullable=True)
    azucares_anadidos: Mapped[float | None] = mapped_column(Float, nullable=True)
    grasas_totales: Mapped[float | None] = mapped_column(Float, nullable=True)
    grasas_saturadas: Mapped[float | None] = mapped_column(Float, nullable=True)
    sodio: Mapped[float | None] = mapped_column(Float, nullable=True)
    peso_unidad: Mapped[float | None] = mapped_column(Float, nullable=True)

    aporta_azucares: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    aporta_grasas: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    aporta_sodio: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    aporta_edulcorantes: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    aporta_cafeina: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    tipo_herencia: Mapped[str] = mapped_column(String(30))

    __mapper_args__ = {
        "polymorphic_on" : "tipo_herencia",         # Le dice a SQLAlchemy que la columna tipo_herencia es el discriminador para saber si es un insumo normal o quimico
        "polymorphic_identity" : "general"      # Sirve para que cuando se cree un insumo normal (no quimico) en el campo de tipo_herencia se guarde "general"
    }


