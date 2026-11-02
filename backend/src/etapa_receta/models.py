from typing import TYPE_CHECKING
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, ForeignKey

if TYPE_CHECKING:
    from src.receta.models import Receta
    from src.paso_etapa.models import PasoEtapa


class EtapaReceta(ModeloBase):
    __tablename__ = "etapas_receta"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    receta_id: Mapped[int] = mapped_column(ForeignKey("recetas.id", ondelete="CASCADE"), nullable=False, index=True)
    receta: Mapped["Receta"] = relationship(back_populates="etapas")

    nombre: Mapped[str] = mapped_column(String(80), nullable=False)
    orden: Mapped[int] = mapped_column(Integer, nullable=False)

    # One-to-Many
    pasos: Mapped[list["PasoEtapa"]] = relationship(
        back_populates="etapa",
        cascade="all, delete-orphan", # si se borra una etapa se borran los pasos
        order_by="PasoEtapa.orden",
    )
