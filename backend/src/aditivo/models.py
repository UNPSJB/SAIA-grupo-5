from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean
from src.models import ModeloBase
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.informacion_nutricional_insumo.models import InformacionNutricionalInsumo


class Aditivo(ModeloBase):
    __tablename__ = "aditivos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    clase_funcional: Mapped[str] = mapped_column(String(40), index=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    numero_ins: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    #informacion_nutricional: Mapped["InformacionNutricionalInsumo | None"] = relationship(back_populates="insumo")

