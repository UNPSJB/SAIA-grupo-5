# scripts/seed_tareas_ocurrencia.py
"""
Pobla la base de datos con ocurrencias de tareas de prueba, tomando como
base (snapshot) las tareas ya existentes. No hay FK real hacia Tarea ni
hacia Persona (diseño memento: ver src/tareas_ocurrencia/models.py),
pero operario_id se completa con ids reales de personal con capacidad
operar (si no hay ninguno cargado, queda en None).
Requiere haber corrido antes: python -m scripts.seed_tareas
                               python -m scripts.seed_personal (opcional)
Uso: python -m scripts.seed_tareas_ocurrencia
"""
from datetime import date, timedelta

from faker import Faker
from sqlalchemy import select

import src.all_models
from src.database import SessionLocal
from src.tarea.models import Tarea
from src.personal.models import Persona
from src.tareas_ocurrencia.models import TareaOcurrencia
from src.tareas_ocurrencia.constants import EstadoTareaOcurrencia

fake = Faker("es_AR")
Faker.seed(42)


def generar_ocurrencias(db) -> list[TareaOcurrencia]:
    tareas = db.scalars(select(Tarea)).all()
    # operario_id no tiene FK real (diseño memento), pero ahora sí existe
    # Persona con capacidad operar: usamos esos ids en vez de un placeholder.
    operarios_id = [p.id for p in db.scalars(select(Persona).where(Persona.operar == True)).all()]
    hoy = date.today()

    ocurrencias = []
    for tarea in tareas:
        # Una ocurrencia pasada ya completada
        fecha_pasada = hoy - timedelta(days=tarea.frecuencia)
        ocurrencias.append(
            TareaOcurrencia(
                operario_id=fake.random_element(elements=operarios_id) if operarios_id else None,
                tarea_nombre_snap=tarea.nombre,
                tarea_descripcion_snap=tarea.descripcion,
                frecuencia_snap=str(tarea.frecuencia),
                prioridad_snap=tarea.prioridad.value,
                foto_obligatoria_snap=tarea.foto_obligatoria,
                accion_correctiva_snap=tarea.accion_correctiva,
                plan_nombre_snap=tarea.plan_limpieza.nombre,
                fecha=fecha_pasada,
                fecha_completado=fecha_pasada,
                estado=EstadoTareaOcurrencia.COMPLETADA,
            )
        )
        # La ocurrencia de hoy, todavía pendiente
        ocurrencias.append(
            TareaOcurrencia(
                operario_id=None,
                tarea_nombre_snap=tarea.nombre,
                tarea_descripcion_snap=tarea.descripcion,
                frecuencia_snap=str(tarea.frecuencia),
                prioridad_snap=tarea.prioridad.value,
                foto_obligatoria_snap=tarea.foto_obligatoria,
                accion_correctiva_snap=tarea.accion_correctiva,
                plan_nombre_snap=tarea.plan_limpieza.nombre,
                fecha=hoy,
                fecha_completado=None,
                estado=EstadoTareaOcurrencia.PENDIENTE,
            )
        )
    return ocurrencias


def main():
    db = SessionLocal()
    try:
        ocurrencias = generar_ocurrencias(db)
        if not ocurrencias:
            print("No hay tareas cargadas. Correr antes scripts.seed_tareas.")
            return

        db.add_all(ocurrencias)
        db.commit()

        print(f"Se insertaron {len(ocurrencias)} ocurrencias de tareas.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
