import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from src.database import SessionLocal
from src.tareas_ocurrencia.services import generar_ocurrencias_pendientes

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def job_generar_ocurrencias():
    db = SessionLocal()
    try:
        generadas = generar_ocurrencias_pendientes(db)
        db.commit()
        logger.info(f"Se generaron {len(generadas)} ocurrencias de tareas.")
    finally:
        db.close()


def iniciar_scheduler():
    scheduler.add_job(
        job_generar_ocurrencias,
        trigger=CronTrigger(hour=7, minute=0), # todos los días a las 07:00 TODO: esto debería ser modificable para el admin
        id="generar_ocurrencias",
        replace_existing=True,
        misfire_grace_time=3600,
    )
    scheduler.start()
