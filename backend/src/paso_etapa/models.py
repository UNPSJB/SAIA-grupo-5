from typing import TYPE_CHECKING
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, ForeignKey

if TYPE_CHECKING:
    from src.etapa_receta.models import EtapaReceta


class PasoEtapa(ModeloBase):
    __tablename__ = "pasos_etapa"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    etapa_id: Mapped[int] = mapped_column(ForeignKey("etapas_receta.id", ondelete="CASCADE"), nullable=False, index=True)
    etapa: Mapped["EtapaReceta"] = relationship(back_populates="pasos")

    descripcion: Mapped[str] = mapped_column(String(500), nullable=False)
    orden: Mapped[int] = mapped_column(Integer, nullable=False)
