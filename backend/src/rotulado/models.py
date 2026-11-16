from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Boolean, DateTime, Index, Integer, String, text
from src.models import ModeloBase


class ReglasRotulado(ModeloBase):
    __tablename__ = "reglas_rotulado"
    __table_args__ = (
        Index("ix_unica_version_vigente_reglas_rotulado", "vigente", unique=True, sqlite_where=text("vigente = 1")),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    vigente: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    fecha_desde_vigencia: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now)
    fecha_hasta_vigencia: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    observacion: Mapped[str] = mapped_column(String(300), nullable=False)

    requiere_envasado_ausencia_cliente: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    aplica_por_azucares: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    aplica_por_grasas: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    aplica_por_sodio: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    aplica_por_edulcorantes: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    aplica_por_cafeina: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    mensaje_no_corresponde: Mapped[str] = mapped_column(String(300), nullable=False)
    mensaje_exceptuado: Mapped[str] = mapped_column(String(300), nullable=False)
