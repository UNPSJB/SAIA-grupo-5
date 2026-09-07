from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String
from src.personal.constants import Capacidades


class Persona(ModeloBase):
    __tablename__ = "personal"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(40), index=True, nullable=False) 
    operar: Mapped[bool] = mapped_column(nullable=False, default=False)
    administrar: Mapped[bool] = mapped_column(nullable=False, default=False)

    @property
    def capacidades(self) -> set[Capacidades]:
        capacidades = set()
        if self.operar:
            capacidades.add(Capacidades.OPERAR)
        if self.administrar:
            capacidades.add(Capacidades.ADMINISTRAR)
        return capacidades
