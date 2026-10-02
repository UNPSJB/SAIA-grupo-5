from typing import TYPE_CHECKING
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, ForeignKey

if TYPE_CHECKING:
    from src.documentos.models import Documento

class TipoDocumento(ModeloBase):
    __tablename__ = "tipos_documentos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(60), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(String(100), nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    documentos: Mapped[list["Documento"]] = relationship(back_populates="tipo")
