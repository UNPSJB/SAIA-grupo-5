# scripts/seed_historial_test.py
"""
Únicamente para probar la pantalla de Historial

Cada corrida agrega registros nuevos 

Requiere haber corrido antes: 
1. python -m scripts.seed_tareas
2. python -m scripts.seed_personal (opcional)

Uso: python -m scripts.seed_historial_test
"""
from datetime import date, timedelta

from sqlalchemy import select

import src.all_models
from src.database import SessionLocal
from src.tarea.models import Tarea
from src.personal.models import Persona
from src.tareas_ocurrencia.models import TareaOcurrencia
from src.tareas_ocurrencia.constants import EstadoTareaOcurrencia

# Cuántos períodos de frecuencia hacia atrás se generan por tarea.
CICLOS_HACIA_ATRAS = 6


def generar_historial_test(db) -> list[TareaOcurrencia]:
    tareas = db.scalars(select(Tarea)).all()
    operarios_id = [p.id for p in db.scalars(select(Persona).where(Persona.operar == True)).all()]
    hoy = date.today()

    ocurrencias = []
    for tarea in tareas:
        for ciclo in range(CICLOS_HACIA_ATRAS):
            fecha = hoy - timedelta(days=tarea.frecuencia * ciclo)

            if ciclo == 0:
                # Período actual: todavía no venció, sigue pendiente.
                estado = EstadoTareaOcurrencia.PENDIENTE
                fecha_completado = None
            elif ciclo % 2 == 0:
                # Se completó dentro de su propio período.
                estado = EstadoTareaOcurrencia.COMPLETADA
                fecha_completado = fecha
            else:
                # Quedó pendiente y su período ya venció -> el front la
                # deriva como "Incumplida" (ver getEstadoHistorial).
                estado = EstadoTareaOcurrencia.PENDIENTE
                fecha_completado = None

            ocurrencias.append(
                TareaOcurrencia(
                    operario_id=(
                        operarios_id[ciclo % len(operarios_id)]
                        if operarios_id and estado == EstadoTareaOcurrencia.COMPLETADA
                        else None
                    ),
                    tarea_nombre_snap=tarea.nombre,
                    tarea_descripcion_snap=tarea.descripcion,
                    frecuencia_snap=str(tarea.frecuencia),
                    prioridad_snap=tarea.prioridad.value,
                    foto_obligatoria_snap=tarea.foto_obligatoria,
                    accion_correctiva_snap=tarea.accion_correctiva,
                    plan_nombre_snap=tarea.plan_limpieza.nombre,
                    fecha=fecha,
                    fecha_completado=fecha_completado,
                    estado=estado,
                )
            )
    return ocurrencias


def main():
    db = SessionLocal()
    try:
        ocurrencias = generar_historial_test(db)
        if not ocurrencias:
            print("No hay tareas cargadas. Correr antes scripts.seed_tareas.")
            return

        db.add_all(ocurrencias)
        db.commit()

        completadas = sum(1 for o in ocurrencias if o.estado == EstadoTareaOcurrencia.COMPLETADA)
        pendientes = len(ocurrencias) - completadas
        print(
            f"Se insertaron {len(ocurrencias)} ocurrencias de historial de prueba "
            f"({completadas} completadas, {pendientes} pendientes/incumplidas)."
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()
