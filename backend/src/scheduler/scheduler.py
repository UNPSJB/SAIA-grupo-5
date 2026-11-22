import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from src.database import SessionLocal
from src.tareas_ocurrencia.services import generar_ocurrencias_pendientes
from src.notificaciones.services import (
    generar_notificaciones_alerta_stock,
    generar_notificaciones_calibracion_equipos,
    generar_notificaciones_habilitacion_proveedor,
    generar_notificaciones_pedidos_demorados,
    generar_notificaciones_recambio_elementos,
    generar_notificaciones_vencimiento_insumo_lote,
    generar_notificaciones_vencimiento_personal,
)

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

JOB_ID_GENERAR_OCURRENCIAS = "generar_ocurrencias"
JOB_ID_NOTIFICACIONES_RECAMBIO_ELEMENTOS = "generar_notificaciones_recambio_elementos"
JOB_ID_NOTIFICACIONES_VENCIMIENTO_PERSONAL = "generar_notificaciones_vencimiento_personal"
JOB_ID_NOTIFICACIONES_CALIBRACION_EQUIPOS = "generar_notificaciones_calibracion_equipos"
JOB_ID_NOTIFICACIONES_ALERTA_STOCK = "generar_notificaciones_alerta_stock"
JOB_ID_NOTIFICACIONES_VENCIMIENTO_INSUMO_LOTE = "generar_notificaciones_vencimiento_insumo_lote"
JOB_ID_NOTIFICACIONES_HABILITACION_PROVEEDOR = "generar_notificaciones_habilitacion_proveedor"
JOB_ID_NOTIFICACIONES_PEDIDOS_DEMORADOS = "generar_notificaciones_pedidos_demorados"


def job_generar_ocurrencias():
    db = SessionLocal()
    try:
        generadas = generar_ocurrencias_pendientes(db)
        db.commit()
        logger.info(f"Se generaron {len(generadas)} ocurrencias de tareas.")
    finally:
        db.close()


def job_generar_notificaciones_recambio_elementos():
    db = SessionLocal()
    try:
        creadas = generar_notificaciones_recambio_elementos(db)
        logger.info(f"Se generaron {len(creadas)} notificaciones de recambio de elementos de limpieza.")
    finally:
        db.close()


def job_generar_notificaciones_vencimiento_personal():
    db = SessionLocal()
    try:
        creadas = generar_notificaciones_vencimiento_personal(db)
        logger.info(f"Se generaron {len(creadas)} notificaciones de vencimiento de personal.")
    finally:
        db.close()


def job_generar_notificaciones_calibracion_equipos():
    db = SessionLocal()
    try:
        creadas = generar_notificaciones_calibracion_equipos(db)
        logger.info(f"Se generaron {len(creadas)} notificaciones de calibración de equipos.")
    finally:
        db.close()


def job_generar_notificaciones_alerta_stock():
    db = SessionLocal()
    try:
        creadas = generar_notificaciones_alerta_stock(db)
        logger.info(f"Se generaron {len(creadas)} notificaciones de alerta de stock.")
    finally:
        db.close()


def job_generar_notificaciones_vencimiento_insumo_lote():
    db = SessionLocal()
    try:
        creadas = generar_notificaciones_vencimiento_insumo_lote(db)
        logger.info(f"Se generaron {len(creadas)} notificaciones de vencimiento de insumos lote.")
    finally:
        db.close()


def job_generar_notificaciones_habilitacion_proveedor():
    db = SessionLocal()
    try:
        creadas = generar_notificaciones_habilitacion_proveedor(db)
        logger.info(f"Se generaron {len(creadas)} notificaciones de habilitacion de proveedores.")
    finally:
        db.close()


def job_generar_notificaciones_pedidos_demorados():
    db = SessionLocal()
    try:
        creadas = generar_notificaciones_pedidos_demorados(db)
        logger.info(f"Se generaron {len(creadas)} notificaciones de pedidos a proveedor demorados.")
    finally:
        db.close()


def iniciar_scheduler():
    # Import local para evitar import circular
    from src.configuracion_sistema.services import obtener_o_crear_configuracion

    db = SessionLocal()
    try:
        configuracion = obtener_o_crear_configuracion(db)
        hour = configuracion.hora_generacion_checklists
        minute = configuracion.minuto_generacion_checklists
    finally:
        db.close()

    scheduler.add_job(
        job_generar_ocurrencias,
        trigger=CronTrigger(hour=hour, minute=minute), # configurable, ver configuracion_sistema
        id=JOB_ID_GENERAR_OCURRENCIAS,
        replace_existing=True,
        misfire_grace_time=3600,
    )
    scheduler.add_job(
        job_generar_notificaciones_recambio_elementos,
        trigger=CronTrigger(hour=hour, minute=minute), # mismo horario que la generación de checklists
        id=JOB_ID_NOTIFICACIONES_RECAMBIO_ELEMENTOS,
        replace_existing=True,
        misfire_grace_time=3600,
    )
    scheduler.add_job(
        job_generar_notificaciones_vencimiento_personal,
        trigger=CronTrigger(hour=hour, minute=minute), # mismo horario que la generación de checklists
        id=JOB_ID_NOTIFICACIONES_VENCIMIENTO_PERSONAL,
        replace_existing=True,
        misfire_grace_time=3600,
    )
    scheduler.add_job(
        job_generar_notificaciones_calibracion_equipos,
        trigger=CronTrigger(hour=hour, minute=minute), # mismo horario que la generación de checklists
        id=JOB_ID_NOTIFICACIONES_CALIBRACION_EQUIPOS,
        replace_existing=True,
        misfire_grace_time=3600,
    )
    scheduler.add_job(
        job_generar_notificaciones_alerta_stock,
        trigger=CronTrigger(hour=hour, minute=minute), # mismo horario que la generación de checklists
        id=JOB_ID_NOTIFICACIONES_ALERTA_STOCK,
        replace_existing=True,
        misfire_grace_time=3600,
    )
    scheduler.add_job(
        job_generar_notificaciones_vencimiento_insumo_lote,
        trigger=CronTrigger(hour=hour, minute=minute),
        id=JOB_ID_NOTIFICACIONES_VENCIMIENTO_INSUMO_LOTE,
        replace_existing=True,
        misfire_grace_time=3600,
    )
    scheduler.add_job(
        job_generar_notificaciones_habilitacion_proveedor,
        trigger=CronTrigger(hour=hour, minute=minute),
        id=JOB_ID_NOTIFICACIONES_HABILITACION_PROVEEDOR,
        replace_existing=True,
        misfire_grace_time=3600,
    )
    scheduler.add_job(
        job_generar_notificaciones_pedidos_demorados,
        trigger=CronTrigger(hour=hour, minute=minute),
        id=JOB_ID_NOTIFICACIONES_PEDIDOS_DEMORADOS,
        replace_existing=True,
        misfire_grace_time=3600,
    )
    scheduler.start()


def reprogramar_generacion_checklists(hour: int, minute: int):

    # Cambia la hora/minuto de los jobs ya programados sin reiniciar el scheduler
    for job_id in (
        JOB_ID_GENERAR_OCURRENCIAS,
        JOB_ID_NOTIFICACIONES_RECAMBIO_ELEMENTOS,
        JOB_ID_NOTIFICACIONES_VENCIMIENTO_PERSONAL,
        JOB_ID_NOTIFICACIONES_CALIBRACION_EQUIPOS,
        JOB_ID_NOTIFICACIONES_ALERTA_STOCK,
        JOB_ID_NOTIFICACIONES_VENCIMIENTO_INSUMO_LOTE,
        JOB_ID_NOTIFICACIONES_HABILITACION_PROVEEDOR,
        JOB_ID_NOTIFICACIONES_PEDIDOS_DEMORADOS,
    ):
        scheduler.reschedule_job(job_id, trigger=CronTrigger(hour=hour, minute=minute))
    logger.info(f"Se reprogramó la generación de ocurrencias para las {hour:02d}:{minute:02d}.")
