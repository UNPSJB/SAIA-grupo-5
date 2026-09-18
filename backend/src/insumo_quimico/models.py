from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey
from src.insumos.models import Insumo
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.tipo_quimico.models import TipoQuimico

class InsumoQuimico(Insumo):
    __tablename__ = "insumos_quimicos"

    id: Mapped[int] = mapped_column(ForeignKey("insumos.id"), primary_key=True)

    tipo_quimico_id: Mapped[int] = mapped_column(ForeignKey("tipos_quimicos.id"), nullable=False)   # Cuando se cree un insumo quimico se le va a poner el siguiente numero de ID que tenga Insumo
    tipo: Mapped["TipoQuimico"] = relationship(back_populates="insumos_quimicos")        # Reelacionamos 

    __mapper_args__ = {"polymorphic_identity": "quimico"}   # Le avisa a SQLAlchemy que si la columna tipo_herencia de Insumo dice quimico tiene que armar y devolver un objeto de esta clase hija