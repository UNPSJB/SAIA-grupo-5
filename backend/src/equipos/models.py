from typing import TYPE_CHECKING
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from sqlalchemy import ForeignKey

if TYPE_CHECKING:
    from src.sector.models import Sector
    from src.plan_limpieza.models import PlanLimpieza


class Equipo(ModeloBase):
    __tablename__ = "equipos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    categoria: Mapped[str] = mapped_column(String(100))
    ubicacion: Mapped[str] = mapped_column(String(100))
    estado: Mapped[bool] = mapped_column(default=True)
    sector_id: Mapped[int | None] = mapped_column(ForeignKey("sectores.id"), nullable=True)
    sector: Mapped["Sector | None"] = relationship(back_populates="equipos")
    plan_limpieza_id: Mapped[int | None] = mapped_column(ForeignKey("planes_limpieza.id"), nullable=True)
    plan_limpieza: Mapped["PlanLimpieza | None"] = relationship(back_populates="equipos")

    """ # Implementaciones abiertas a cambios futuros

    (DISCUTIR COMO RELACIONAR EL EQUIPO CON EL PLAN DE CALIBRACION)
    (DISCUTIR UN CAMPO ESTADO PARA BAJA LOGICA DEPENDIENDO SI QUEREMOS UN HISTORICO CON CALIBRACION) """

