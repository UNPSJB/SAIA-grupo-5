from datetime import date
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase


class RecambioElementoLimpieza(ModeloBase):
    __tablename__ = "recambios_elementos_limpieza"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    elemento_id: Mapped[int] = mapped_column(ForeignKey("elementos_limpieza.id"), nullable=False)
    fecha: Mapped[date] = mapped_column(nullable=False)
    observacion: Mapped[str | None] = mapped_column(String(255))

    elemento: Mapped["ElementoLimpieza"] = relationship(back_populates="recambios")