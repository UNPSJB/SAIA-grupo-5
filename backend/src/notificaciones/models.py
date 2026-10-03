from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from src.models import ModeloBase


class Notificacion(ModeloBase):
    __tablename__ = "notificaciones"
    __table_args__ = (UniqueConstraint("administrador_id", "clave_origen"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    administrador_id: Mapped[int] = mapped_column(ForeignKey("personal.id"), index=True, nullable=False)
    clave_origen: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    tipo: Mapped[str] = mapped_column(String(50), nullable=False)
    entidad_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    entidad: Mapped[str] = mapped_column(String(200), nullable=False)
    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str | None] = mapped_column(String(300), nullable=True)
    leida: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    resuelta: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    creada_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)
    resuelta_en: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
