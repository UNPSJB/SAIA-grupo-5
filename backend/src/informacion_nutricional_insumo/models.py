from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, ForeignKey, Integer, DateTime, Numeric
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
from src.models import ModeloBase

if TYPE_CHECKING:
    from src.personal.models import Persona
    from src.insumos.models import Insumo
    from src.aditivo.models import Aditivo
    from src.fuente_nutricional.models import FuenteNutricional
    from src.historial_nutricional_insumo.models import HistorialNutricionalInsumo

class InformacionNutricionalInsumo(ModeloBase):
    __tablename__ = "informacion_nutricional_insumos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    #datos por 100g
    insumo_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("insumos.id"), unique=True, nullable=True, index=True)
    aditivo_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("aditivos.id"), unique=True, nullable=True, index=True)
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

    #carga
    fuente_nutricional_id: Mapped[int] = mapped_column(Integer, ForeignKey("fuentes_nutricionales.id"), nullable=False)
    referencia_fuente: Mapped[str | None] = mapped_column(String(200), nullable=False)
    cargada_por_id: Mapped[int] = mapped_column(Integer, ForeignKey("personal.id"), nullable=False)
    fecha_carga: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    #modificacion
    modificado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    modificada_por_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("personal.id"), nullable=True)
    fecha_modificacion: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    insumo: Mapped["Insumo | None"] = relationship(back_populates = "informacion_nutricional")
    aditivo: Mapped["Aditivo | None"] = relationship()
    fuente_nutricional: Mapped["FuenteNutricional"] = relationship()
    cargada_por: Mapped["Persona"] = relationship(foreign_keys=[cargada_por_id])
    modificada_por: Mapped["Persona | None"] = relationship(foreign_keys=[modificada_por_id])
    historial_cambios: Mapped[list["HistorialNutricionalInsumo"]] = relationship(back_populates="info_nutricional")

