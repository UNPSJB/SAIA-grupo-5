from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from src.declaracion_alergenos.constants import EstadoDeclaracion

if TYPE_CHECKING:
    from src.receta.models import Receta
    from src.personal.models import Persona


class DeclaracionAlergenosReceta(ModeloBase):
    __tablename__ = "declaraciones_alergenos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    receta_id: Mapped[int] = mapped_column(Integer, ForeignKey("recetas.id"), nullable=False, index=True)

    alergenos_detectados: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    texto_alergenos: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    contiene_gluten: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    texto_gluten: Mapped[str] = mapped_column(String(200), nullable=False)

    contaminacion_cruzada: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    texto_contaminacion_cruzada: Mapped[str | None] = mapped_column(Text, nullable=True)

    condiciones_conservacion: Mapped[str | None] = mapped_column(Text, nullable=True)

    estado: Mapped[str] = mapped_column(String(40), nullable=False, default=EstadoDeclaracion.SUGERIDA_SISTEMA.value)
    confirmada_por_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("personal.id"), nullable=True)
    fecha_confirmacion: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    receta: Mapped["Receta"] = relationship()
    confirmada_por: Mapped["Persona | None"] = relationship()

