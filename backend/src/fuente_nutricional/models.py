from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, ForeignKey, Integer, DateTime, Numeric
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
from src.models import ModeloBase


if TYPE_CHECKING:
    from src.personal.models import Persona

class FuenteNutricional(ModeloBase):
    __tablename__ = "fuentes_nutricionales"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(60), unique=True, index=True, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(String(500), nullable=True)
    origen: Mapped[str | None] = mapped_column(String(500), nullable=True)
    licencia_uso: Mapped[str] = mapped_column(String(500), nullable=False)
    formato_uso: Mapped[str] = mapped_column(String(500), nullable=False)
    licencia_verificada: Mapped[bool] = mapped_column(Boolean, default=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    verificada_por_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("personal.id"), nullable=True)
    fecha_verificacion: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    verificada_por: Mapped["Persona"] = relationship()

class AlimentoReferencia(ModeloBase):
    __tablename__ = "alimentos_referencia"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(300), nullable=False, index=True)
    fuente_nutricional_id: Mapped[int] = mapped_column(Integer, ForeignKey("fuentes_nutricionales.id"), nullable=False, index=True)
    codigo_externo: Mapped[str | None] = mapped_column(String(30), index=True, nullable=True)
    valor_energetico: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    carbohidratos: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    azucares_totales: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    azucares_anadidos: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    proteinas: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    grasas_totales: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    grasas_saturadas: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    grasas_trans: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    fibra_alimentaria: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    sodio: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    
    fuente_nutricional: Mapped["FuenteNutricional"] = relationship()

