from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean
from src.personal.constants import Capacidades


class Persona(ModeloBase):
    __tablename__ = "personal"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(50), nullable=False)
    apellido: Mapped[str] = mapped_column(String(50), nullable=False)
    dni: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    mail: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    operar: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    administrar: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    @property
    def capacidades(self) -> set[Capacidades]:
        capacidades = set()
        if self.operar:
            capacidades.add(Capacidades.OPERAR)
        if self.administrar:
            capacidades.add(Capacidades.ADMINISTRAR)
        return capacidades

    @property
    def is_admin(self) -> bool:
        return bool(self.administrar)

    @property
    def role_name(self) -> str:
        return "admin" if self.administrar else "operario"

    @property
    def role_id(self) -> int:
        return 1 if self.administrar else 2
