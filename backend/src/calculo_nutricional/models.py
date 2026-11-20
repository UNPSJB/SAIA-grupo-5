from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, Integer, Numeric, DateTime, ForeignKey, JSON
from decimal import Decimal
from datetime import datetime
from typing import TYPE_CHECKING
from src.models import ModeloBase

if TYPE_CHECKING:
    from src.receta.models import Receta

class ConfiguracionCalculoNutricional(ModeloBase):
    __tablename__ = "configuracion_calculo_nutricional"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    factor_conversion_kj: Mapped[Decimal] = mapped_column(Numeric(6,4), nullable=False, default=Decimal("4.18"))
    texto_no_significativo: Mapped[str] = mapped_column(String(100), index=True, nullable=False, default="0")
    decimales_menor_a_1: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    decimales_entre_1_y_10: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    decimales_mayor_igual_10: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

class ParametroNutriente(ModeloBase):
    __tablename__ = "parametros_nutrientes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    codigo_nutriente: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    unidad: Mapped[str] = mapped_column(String(10), nullable=False)
    valor_diario_referencia: Mapped[Decimal | None] = mapped_column(Numeric(10,2), nullable=True, index=True)
    declara_porcentaje_vd: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    umbral_no_significativo: Mapped[Decimal] = mapped_column(Numeric(10,4), nullable=False, default=Decimal("0"))
    orden_tabla: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

class InformacionNutricionalReceta(ModeloBase):
    __tablename__ = "informacion_nutricional_recetas"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    receta_id: Mapped[int] = mapped_column(Integer, ForeignKey("recetas.id"), unique=True, nullable=False, index=True)
    rendimiento: Mapped[float] = mapped_column(Numeric(12,2), nullable=False)
    porcion: Mapped[float] = mapped_column(Numeric(12,2), nullable=False)
    tabla_nutricional: Mapped[list[dict]] = mapped_column(JSON, nullable=False)
    fecha_calculo: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    receta: Mapped["Receta"] = relationship()
