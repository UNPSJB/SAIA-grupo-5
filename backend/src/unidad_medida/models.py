from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean, Float
from src.models import ModeloBase

class UnidadMedida(ModeloBase):
    __tablename__ = "unidades_medida"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(40), unique=True, index=True, nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    # Unidades estándar (mg, g, kg, ml, l), cargados al iniciar
    codigo: Mapped[str | None] = mapped_column(String(10), unique=True, index=True, nullable=True)
    masa_volumen: Mapped[str | None] = mapped_column(String(10), nullable=True)
    factor_a_base: Mapped[float | None] = mapped_column(Float, nullable=True)
