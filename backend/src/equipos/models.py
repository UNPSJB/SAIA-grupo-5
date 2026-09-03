from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase
from sqlalchemy import ForeignKey


class Equipo(ModeloBase):
    __tablename__ = "equipos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    categoria: Mapped[str] = mapped_column(String(100))
    ubicacion: Mapped[str] = mapped_column(String(100))

    """ # Implementaciones abiertas a cambios futuros

    #Clave foranea al plan de limpieza del equipo
    plan_limpieza_id: Mapped[int] = mapped_column(ForeignKey("plan_limpieza.id"))

    #Relacion ORM para la navegacion con plan limpieza (Consultar la relacion Plan_Limpieza-Equipo)
    plan_limpieza: Mapped["Plan_limpieza"] = relationship(back_populates="equipo")

    (DISCUTIR COMO RELACIONAR EL EQUIPO CON EL PLAN DE CALIBRACION)
    (DISCUTIR UN CAMPO ESTADO PARA BAJA LOGICA DEPENDIENDO SI QUEREMOS UN HISTORICO CON CALIBRACION) """

