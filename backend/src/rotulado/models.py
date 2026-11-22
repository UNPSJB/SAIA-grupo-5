from datetime import date, datetime
from typing import TYPE_CHECKING
from sqlalchemy import (
    JSON, Boolean, Date, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint, text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase

if TYPE_CHECKING:
    from src.personal.models import Persona
    from src.producto.models import Producto


class ReglasRotulado(ModeloBase):
    __tablename__ = "reglas_rotulado"
    __table_args__ = (
        Index("ix_unica_version_vigente_reglas_rotulado", "vigente", unique=True, sqlite_where=text("vigente = 1")),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    vigente: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    fecha_desde_vigencia: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now)
    fecha_hasta_vigencia: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    observacion: Mapped[str] = mapped_column(String(300), nullable=False)

    requiere_envasado_ausencia_cliente: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    aplica_por_azucares: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    aplica_por_grasas: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    aplica_por_sodio: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    aplica_por_edulcorantes: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    aplica_por_cafeina: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    formato_declaracion_aditivos: Mapped[str] = mapped_column(String(20), nullable=False, default="nombre_e_ins")
    mensaje_no_corresponde: Mapped[str] = mapped_column(String(300), nullable=False)
    mensaje_exceptuado: Mapped[str] = mapped_column(String(300), nullable=False)


class RotuladoProducto(ModeloBase):
    """Datos del rótulo del Capítulo V del CAA que declara el elaborador.

    Los datos que el sistema ya conoce (denominación, contenido neto, ingredientes y
    lote) se completan solos y quedan guardados acá cuando el usuario los confirma o
    los edita; cada cambio queda registrado en HistorialRotuladoProducto.
    """

    __tablename__ = "rotulado_productos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    producto_id: Mapped[int] = mapped_column(
        ForeignKey("productos.id"), unique=True, nullable=False, index=True
    )

    denominacion_venta: Mapped[str | None] = mapped_column(String(120), nullable=True)
    contenido_neto: Mapped[str | None] = mapped_column(String(60), nullable=True)
    lista_ingredientes: Mapped[str | None] = mapped_column(Text, nullable=True)

    razon_social: Mapped[str | None] = mapped_column(String(150), nullable=True)
    domicilio: Mapped[str | None] = mapped_column(String(200), nullable=True)
    # RNPA (producto nacional) o RPPA (producto provincial): se declara, no se verifica.
    numero_registro: Mapped[str | None] = mapped_column(String(30), nullable=True)

    identificacion_lote: Mapped[str | None] = mapped_column(String(100), nullable=True)
    fecha_duracion: Mapped[date | None] = mapped_column(Date, nullable=True)
    instrucciones_uso: Mapped[str | None] = mapped_column(Text, nullable=True)

    es_importado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    importador_razon_social: Mapped[str | None] = mapped_column(String(150), nullable=True)
    importador_domicilio: Mapped[str | None] = mapped_column(String(200), nullable=True)
    importador_cuit: Mapped[str | None] = mapped_column(String(20), nullable=True)

    actualizado_por_id: Mapped[int | None] = mapped_column(ForeignKey("personal.id"), nullable=True)
    fecha_actualizacion: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    orden_ingredientes_manual: Mapped[list[int] | None] = mapped_column(JSON, nullable=True)
    producto: Mapped["Producto"] = relationship()
    actualizado_por: Mapped["Persona | None"] = relationship()
    historial: Mapped[list["HistorialRotuladoProducto"]] = relationship(
        back_populates="rotulado",
        cascade="all, delete-orphan",
        order_by="HistorialRotuladoProducto.fecha_hora.desc()",
    )


class VersionEmpaquetado(ModeloBase):
    """Versión del empaquetado: la foto del envase y las posiciones elegidas.

    Igual que las reglas de rotulado, cada producto tiene una única versión vigente;
    al guardar una nueva, la anterior queda en el historial con su fecha de fin.
    """

    __tablename__ = "versiones_empaquetado"
    __table_args__ = (
        Index("ix_unica_version_vigente_empaquetado", "producto_id", "vigente",
              unique=True, sqlite_where=text("vigente = 1")),
        UniqueConstraint("producto_id", "version", name="uq_version_empaquetado_producto"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    vigente: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Foto del envase como data URL (el administrador puede no subir ninguna).
    foto: Mapped[str | None] = mapped_column(Text, nullable=True)
    elementos: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    observacion: Mapped[str | None] = mapped_column(String(300), nullable=True)

    creado_por_id: Mapped[int | None] = mapped_column(ForeignKey("personal.id"), nullable=True)
    fecha_desde_vigencia: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now)
    fecha_hasta_vigencia: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    producto: Mapped["Producto"] = relationship()
    creado_por: Mapped["Persona | None"] = relationship()


class HistorialRotuladoProducto(ModeloBase):
    """Constancia de los cambios hechos sobre los datos del rótulo declarados."""

    __tablename__ = "historial_rotulado_productos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    rotulado_id: Mapped[int] = mapped_column(
        ForeignKey("rotulado_productos.id", ondelete="CASCADE"), nullable=False, index=True
    )

    campo: Mapped[str] = mapped_column(String(40), nullable=False)
    valor_anterior: Mapped[str | None] = mapped_column(Text, nullable=True)
    valor_nuevo: Mapped[str | None] = mapped_column(Text, nullable=True)

    usuario_id: Mapped[int | None] = mapped_column(ForeignKey("personal.id"), nullable=True)
    fecha_hora: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now)

    rotulado: Mapped["RotuladoProducto"] = relationship(back_populates="historial")
    usuario: Mapped["Persona | None"] = relationship()
