import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from src.database import SessionLocal
from src.tareas_ocurrencia.services import generar_ocurrencias_pendientes

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

JOB_ID_GENERAR_OCURRENCIAS = "generar_ocurrencias"


def job_generar_ocurrencias():
    db = SessionLocal()
    try:
        generadas = generar_ocurrencias_pendientes(db)
        db.commit()
        logger.info(f"Se generaron {len(generadas)} ocurrencias de tareas.")
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
    scheduler.start()


def reprogramar_generacion_checklists(hour: int, minute: int):

    # Cambia la hora/minuto del job ya programado sin reiniciar el scheduler
    scheduler.reschedule_job(JOB_ID_GENERAR_OCURRENCIAS, trigger=CronTrigger(hour=hour, minute=minute))
    logger.info(f"Se reprogramó la generación de ocurrencias para las {hour:02d}:{minute:02d}.")
