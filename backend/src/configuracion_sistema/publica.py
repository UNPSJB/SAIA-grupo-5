import secrets
from datetime import date, datetime, timedelta

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from src.configuracion_sistema.models import ConfiguracionSistema
from src.configuracion_sistema.schemas import IndicadorVistaPublica, VistaPublica
from src.configuracion_sistema.services import obtener_o_crear_configuracion
from src.documentos.models import Documento
from src.elementosLimpieza.models import ElementoLimpieza
from src.lote_produccion.models import LoteProduccion
from src.plan_limpieza.models import PlanLimpieza
from src.planesCalibracion.models import PlanCalibracion
from src.recambiosElementosLimpieza.models import RecambioElementoLimpieza
from src.registrosCalibracion.models import RegistroCalibracion
from src.tareas_ocurrencia.constants import EstadoTareaOcurrencia
from src.tareas_ocurrencia.models import TareaOcurrencia
from src.version_documento.models import VersionDocumento


def actualizar_vista_publica(db: Session, datos) -> ConfiguracionSistema:
    configuracion = obtener_o_crear_configuracion(db)
    cambios = datos.model_dump(exclude_unset=True)

    if cambios.get("vista_publica_activa") is True and not configuracion.vista_publica_token:
        configuracion.vista_publica_token = secrets.token_urlsafe(32)

    if cambios.get("vista_publica_activa") is False:
        configuracion.vista_publica_token = None

    for clave, valor in cambios.items():
        if clave != "vista_publica_token":
            setattr(configuracion, clave, valor)

    db.commit()
    db.refresh(configuracion)
    return configuracion


def _indicador(clave: str, titulo: str, descripcion: str, valor: str, icono: str) -> IndicadorVistaPublica:
    return IndicadorVistaPublica(
        clave=clave,
        titulo=titulo,
        descripcion=descripcion,
        valor=valor,
        icono=icono,
    )


def _valor_tiempo(dias: list[int]) -> str:
    promedio = sum(dias) / len(dias)
    if promedio < 1:
        return "Menos de 1 día"
    dias_promedio = round(promedio)
    return f"{dias_promedio} días" if dias_promedio != 1 else "1 día"


def leer_vista_publica(db: Session, token: str) -> VistaPublica | None:
    configuracion = db.scalar(
        select(ConfiguracionSistema).where(
            ConfiguracionSistema.vista_publica_token == token,
            ConfiguracionSistema.vista_publica_activa.is_(True),
        )
    )
    if configuracion is None:
        return None

    indicadores = []
    hoy = date.today()
    inicio_mes = hoy.replace(day=1)

    if (
        configuracion.vista_publica_mostrar_cumplimiento
        or configuracion.vista_publica_mostrar_tareas_realizadas
        or configuracion.vista_publica_mostrar_dias_limpieza
    ):
        ocurrencias = db.scalars(
            select(TareaOcurrencia).where(
                TareaOcurrencia.fecha >= inicio_mes,
                TareaOcurrencia.fecha <= hoy,
            )
        ).all()
        completadas = sum(ocurrencia.estado == EstadoTareaOcurrencia.COMPLETADA for ocurrencia in ocurrencias)
        resueltas = sum(
            ocurrencia.estado == EstadoTareaOcurrencia.COMPLETADA
            or ocurrencia.fecha + timedelta(days=int(ocurrencia.frecuencia_snap or 0)) < hoy
            for ocurrencia in ocurrencias
        )
        cumplimiento = round(completadas * 100 / resueltas) if resueltas else None
        if configuracion.vista_publica_mostrar_cumplimiento and cumplimiento is not None and cumplimiento > 0:
            indicadores.append(_indicador(
                "cumplimiento", "Cumplimiento de limpieza", "Tareas completadas durante este mes",
                f"{cumplimiento}%", "bi-check2-circle",
            ))
        if configuracion.vista_publica_mostrar_tareas_realizadas and completadas > 0:
            indicadores.append(_indicador(
                "tareas_realizadas", "Tareas realizadas", "Tareas completadas durante este mes",
                str(completadas), "bi-clipboard-check",
            ))
        if configuracion.vista_publica_mostrar_dias_limpieza:
            dias_con_limpieza = len({
                ocurrencia.fecha for ocurrencia in ocurrencias
                if ocurrencia.estado == EstadoTareaOcurrencia.COMPLETADA
            })
            if dias_con_limpieza > 0:
                indicadores.append(_indicador(
                    "dias_limpieza", "Días con limpieza registrada", "Días con al menos una tarea realizada este mes",
                    f"{dias_con_limpieza} / {hoy.day}", "bi-calendar-check",
                ))

    if configuracion.vista_publica_mostrar_calibraciones or configuracion.vista_publica_mostrar_tiempo_calibracion:
        planes = db.scalars(select(PlanCalibracion).where(PlanCalibracion.estado.is_(True))).all()
        al_dia = 0
        demoras_calibracion = []
        for plan in planes:
            registros = db.scalars(
                select(RegistroCalibracion)
                .where(RegistroCalibracion.plan_calibracion_id == plan.id)
                .order_by(RegistroCalibracion.fecha, RegistroCalibracion.id)
            ).all()
            fecha_base = plan.fecha_inicio
            for registro in registros:
                fecha_programada = fecha_base + timedelta(days=plan.periodicidad)
                demoras_calibracion.append(max(0, (registro.fecha - fecha_programada).days))
                fecha_base = registro.fecha
            if fecha_base + timedelta(days=plan.periodicidad) >= hoy:
                al_dia += 1

        if configuracion.vista_publica_mostrar_calibraciones and planes and al_dia > 0:
            indicadores.append(_indicador(
                "calibraciones", "Equipos con calibración al día",
                "Proporción de equipos activos dentro de su plan de calibración",
                f"{round(al_dia * 100 / len(planes))}%", "bi-tools",
            ))
        if configuracion.vista_publica_mostrar_tiempo_calibracion and demoras_calibracion:
            indicadores.append(_indicador(
                "tiempo_calibracion", "Tiempo promedio de calibración",
                "Tiempo promedio entre la fecha programada y la calibración registrada",
                _valor_tiempo(demoras_calibracion), "bi-hourglass-split",
            ))

    if configuracion.vista_publica_mostrar_recambios or configuracion.vista_publica_mostrar_tiempo_recambio:
        elementos = db.scalars(select(ElementoLimpieza).where(
            ElementoLimpieza.estado.is_(True),
            ElementoLimpieza.frecuencia_recambio.is_not(None),
        )).all()
        al_dia = 0
        demoras_recambio = []
        for elemento in elementos:
            recambios = db.scalars(
                select(RecambioElementoLimpieza)
                .where(RecambioElementoLimpieza.elemento_id == elemento.id)
                .order_by(RecambioElementoLimpieza.fecha, RecambioElementoLimpieza.id)
            ).all()
            fecha_base = elemento.fecha_alta
            for recambio in recambios:
                fecha_programada = fecha_base + timedelta(days=elemento.frecuencia_recambio)
                demoras_recambio.append(max(0, (recambio.fecha - fecha_programada).days))
                fecha_base = recambio.fecha
            if fecha_base + timedelta(days=elemento.frecuencia_recambio) >= hoy:
                al_dia += 1

        if configuracion.vista_publica_mostrar_recambios and elementos and al_dia > 0:
            indicadores.append(_indicador(
                "recambios", "Elementos de limpieza dentro del período de recambio",
                "Proporción de elementos activos dentro de su frecuencia programada",
                f"{round(al_dia * 100 / len(elementos))}%", "bi-arrow-repeat",
            ))
        if configuracion.vista_publica_mostrar_tiempo_recambio and demoras_recambio:
            indicadores.append(_indicador(
                "tiempo_recambio", "Tiempo promedio de recambio",
                "Tiempo promedio entre la fecha programada y el recambio registrado",
                _valor_tiempo(demoras_recambio), "bi-hourglass-split",
            ))

    if configuracion.vista_publica_mostrar_planes_limpieza:
        planes_activos = db.scalar(
            select(func.count(PlanLimpieza.id)).where(PlanLimpieza.activo.is_(True))
        )
        if planes_activos:
            indicadores.append(_indicador(
                "planes_limpieza", "Planes de limpieza activos",
                "Cantidad de planes de limpieza vigentes", str(planes_activos), "bi-clipboard-check",
            ))

    if configuracion.vista_publica_mostrar_documentos_tecnicos:
        total_documentos = db.scalar(
            select(func.count(Documento.id)).where(Documento.activo.is_(True))
        ) or 0
        con_vigente = db.scalar(
            select(func.count(Documento.id)).where(
                Documento.activo.is_(True),
                Documento.versiones.any(
                    and_(
                        VersionDocumento.vigente.is_(True),
                        VersionDocumento.activo.is_(True),
                    )
                ),
            )
        ) or 0
        if total_documentos > 0 and con_vigente > 0:
            porcentaje = round(con_vigente * 100 / total_documentos)
            indicadores.append(_indicador(
                "documentos_tecnicos", "Documentos técnicos con versión vigente",
                "Proporción de documentos con versión vigente",
                f"{porcentaje}%", "bi-file-earmark-check",
            ))

    if (
        configuracion.vista_publica_mostrar_productos_elaborados
        or configuracion.vista_publica_mostrar_lotes_producidos
    ):
        filtros_lotes = (
            LoteProduccion.fecha_produccion >= inicio_mes,
            LoteProduccion.fecha_produccion <= hoy,
            LoteProduccion.activo.is_(True),
        )
        lotes_producidos, productos_elaborados = db.execute(
            select(
                func.count(LoteProduccion.id),
                func.count(func.distinct(LoteProduccion.producto_id)),
            ).where(*filtros_lotes)
        ).one()
        if configuracion.vista_publica_mostrar_productos_elaborados and productos_elaborados:
            indicadores.append(_indicador(
                "productos_elaborados", "Productos distintos elaborados",
                "Variedades de productos presentes en los lotes de este mes",
                str(productos_elaborados), "bi-box-seam",
            ))
        if configuracion.vista_publica_mostrar_lotes_producidos and lotes_producidos:
            indicadores.append(_indicador(
                "lotes_producidos", "Lotes producidos",
                "Lotes de producción elaborados durante este mes",
                str(lotes_producidos), "bi-boxes",
            ))

    return VistaPublica(
        establecimiento=configuracion.vista_publica_nombre_establecimiento,
        actualizado=datetime.now().strftime("%d/%m/%Y"),
        indicadores=indicadores,
    )
