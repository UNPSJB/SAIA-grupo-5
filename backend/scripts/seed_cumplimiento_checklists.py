# scripts/seed_cumplimiento_checklists.py
"""
Únicamente para probar el gráfico de "Cumplimiento de checklists" del panel de control

Genera un mes de checklists (ocurrencias) hacia atrás a partir de las tareas
activas diarias y semanales, respetando el período de cada una:
- Diarias: una ocurrencia por día.
- Semanales: una ocurrencia cada 7 días.

La gran mayoría queda completada y muy pocas incompletas. Algunos días puntuales
("días flojos") concentran más incumplimientos para que se vea el contraste en el gráfico.

No genera ocurrencias para hoy (de eso se encarga el generador automático) y no
duplica ocurrencias que ya existan para la misma tarea y fecha, así que se puede
correr más de una vez.

No está incluido en seed_all a propósito.

Requiere haber corrido antes:
1. python -m scripts.seed_tareas
2. python -m scripts.seed_personal (opcional)

Uso: python -m scripts.seed_cumplimiento_checklists
"""
import random
from datetime import date, datetime, time, timedelta

from sqlalchemy import select

import src.all_models
from src.database import SessionLocal
from src.tarea.models import Tarea
from src.tarea.constants import Frecuencia
from src.personal.models import Persona
from src.tareas_ocurrencia.models import TareaOcurrencia
from src.tareas_ocurrencia.constants import EstadoTareaOcurrencia

DIAS_HACIA_ATRAS = 30
FRECUENCIAS = (Frecuencia.DIARIA, Frecuencia.SEMANAL)

# Probabilidad de que una tarea quede incompleta
PROB_INCUMPLIDA = 0.04
PROB_INCUMPLIDA_DIA_FLOJO = 0.35
# Días hacia atrás (desde hoy) con bajo cumplimiento
DIAS_FLOJOS = (4, 11, 12, 23)

rng = random.Random(42)


def generar_cumplimiento(db) -> list[TareaOcurrencia]:
    tareas = db.scalars(
        select(Tarea).where(Tarea.activo == True, Tarea.frecuencia.in_([f.value for f in FRECUENCIAS]))
    ).all()
    operarios_id = [p.id for p in db.scalars(select(Persona).where(Persona.operar == True)).all()]
    hoy = date.today()
    desde = hoy - timedelta(days=DIAS_HACIA_ATRAS)

    # Ocurrencias ya cargadas en el rango, para no duplicar
    existentes = {
        (o.tarea_nombre_snap, o.plan_nombre_snap, o.fecha)
        for o in db.scalars(
            select(TareaOcurrencia).where(TareaOcurrencia.fecha.between(desde, hoy - timedelta(days=1)))
        ).all()
    }

    ocurrencias = []
    for tarea in tareas:
        dias_atras = tarea.frecuencia
        while dias_atras <= DIAS_HACIA_ATRAS:
            fecha = hoy - timedelta(days=dias_atras)
            if (tarea.nombre, tarea.plan_limpieza.nombre, fecha) in existentes:
                dias_atras += tarea.frecuencia
                continue

            prob = PROB_INCUMPLIDA_DIA_FLOJO if dias_atras in DIAS_FLOJOS else PROB_INCUMPLIDA
            completada = rng.random() >= prob

            ocurrencias.append(
                TareaOcurrencia(
                    operario_id=rng.choice(operarios_id) if operarios_id and completada else None,
                    tarea_id_origen=tarea.id,
                    plan_id_origen=tarea.plan_limpieza_id,
                    tarea_nombre_snap=tarea.nombre,
                    tarea_descripcion_snap=tarea.descripcion,
                    frecuencia_snap=str(tarea.frecuencia),
                    prioridad_snap=tarea.prioridad.value,
                    foto_obligatoria_snap=tarea.foto_obligatoria,
                    accion_correctiva_snap=tarea.accion_correctiva,
                    plan_nombre_snap=tarea.plan_limpieza.nombre,
                    fecha=fecha,
                    # Se completó dentro del mismo día, en horario de trabajo
                    fecha_completado=(
                        datetime.combine(fecha, time(rng.randint(7, 17), rng.randint(0, 59)))
                        if completada else None
                    ),
                    # Pendiente con el período vencido -> el front la muestra como "Incumplida"
                    estado=EstadoTareaOcurrencia.COMPLETADA if completada else EstadoTareaOcurrencia.PENDIENTE,
                )
            )
            dias_atras += tarea.frecuencia
    return ocurrencias


def main():
    db = SessionLocal()
    try:
        ocurrencias = generar_cumplimiento(db)
        if not ocurrencias:
            print("No se generaron ocurrencias (no hay tareas diarias/semanales o ya estaban cargadas).")
            return

        db.add_all(ocurrencias)
        db.commit()

        completadas = sum(1 for o in ocurrencias if o.estado == EstadoTareaOcurrencia.COMPLETADA)
        print(
            f"Se insertaron {len(ocurrencias)} ocurrencias de los últimos {DIAS_HACIA_ATRAS} días "
            f"({completadas} completadas, {len(ocurrencias) - completadas} incompletas)."
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()
