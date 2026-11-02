from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Boolean, Integer, String
from src.models import ModeloBase


class ConfiguracionSistema(ModeloBase):
    # Tabla de una sola fila (patrón singleton)

    __tablename__ = "configuracion_sistema"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Antelación de alerta de vencimiento de personal
    dias_antelacion_vencimiento: Mapped[int] = mapped_column(Integer, nullable=False, default=15)

    # Antelación de alerta de vencimiento de elementos de limpieza
    dias_antelacion_elementos: Mapped[int] = mapped_column(Integer, nullable=False, default=15)

    # Hora de generación de las ocurrencias de tareas del checklist
    # ver --> src/scheduler/scheduler.py
    hora_generacion_checklists: Mapped[int] = mapped_column(Integer, nullable=False, default=7)
    minuto_generacion_checklists: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    vista_publica_activa: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    vista_publica_token: Mapped[str | None] = mapped_column(String(64), nullable=True)
    vista_publica_nombre_establecimiento: Mapped[str] = mapped_column(String(100), nullable=False, default="Mi establecimiento")
    vista_publica_mostrar_cumplimiento: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    vista_publica_mostrar_calibraciones: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    vista_publica_mostrar_tiempo_calibracion: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    vista_publica_mostrar_recambios: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    vista_publica_mostrar_tiempo_recambio: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    vista_publica_mostrar_planes_limpieza: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
