from typing import TYPE_CHECKING
from src.models import ModeloBase
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, ForeignKey

if TYPE_CHECKING:
    from src.version_documento.models import VersionDocumento
    from src.tipo_documento.models import TipoDocumento

class Documento(ModeloBase):
    __tablename__ = "documentos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(String(500), nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    tipo_id: Mapped[int] = mapped_column(ForeignKey("tipos_documentos.id"), index=True, nullable=False)

    versiones: Mapped[list["VersionDocumento"]] = relationship(back_populates="documento")
    tipo: Mapped["TipoDocumento"] = relationship(back_populates="tipo_documento")
