from datetime import date
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase


class ElementoLimpieza(ModeloBase):
    __tablename__ = "elementos_limpieza"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    codigo: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    tipo_id: Mapped[int] = mapped_column(ForeignKey("tipos_elemento_limpieza.id"), nullable=False)
    material: Mapped[str | None] = mapped_column(String(100))
    ubicacion: Mapped[str | None] = mapped_column(String(100))
    frecuencia_recambio: Mapped[int | None] = mapped_column()
    fecha_alta: Mapped[date] = mapped_column(default=date.today, nullable=False)
    estado: Mapped[bool] = mapped_column(default=True)

    tipo: Mapped["TipoElementoLimpieza"] = relationship(back_populates="elementos")
    recambios: Mapped[list["RecambioElementoLimpieza"]] = relationship(back_populates="elemento")


class TipoElementoLimpieza(ModeloBase):
    __tablename__ = "tipos_elemento_limpieza"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    prefijo: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    estado: Mapped[bool] = mapped_column(default=True)

    elementos: Mapped[list["ElementoLimpieza"]] = relationship(back_populates="tipo")