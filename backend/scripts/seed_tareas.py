# scripts/seed_tareas.py
"""
Pobla la base de datos con tareas de prueba, asignadas a los planes de
limpieza ya existentes.
Requiere haber corrido antes: python -m scripts.seed_planes_limpieza
Uso: python -m scripts.seed_tareas
"""
from sqlalchemy import select

import src.all_models 
from src.database import SessionLocal
from src.plan_limpieza.models import PlanLimpieza
from src.tarea.models import Tarea
from src.tarea.constants import Frecuencia

TAREAS_POR_PLAN = {
    "Limpieza de cocina": [
        ("Barrer y trapear piso", Frecuencia.DIARIA),
        ("Limpiar mesadas y bachas", Frecuencia.DIARIA),
        ("Desengrasar campana extractora", Frecuencia.MENSUAL),
    ],
    "Limpieza de obrador": [
        ("Limpiar mesada de trabajo", Frecuencia.DIARIA),
        ("Desinfectar utensilios", Frecuencia.DIARIA),
        ("Limpieza profunda de amasadora", Frecuencia.QUINCENAL),
    ],
    "Limpieza de cámaras frigoríficas": [
        ("Verificar temperatura", Frecuencia.DIARIA),
        ("Limpiar estantes y paredes internas", Frecuencia.SEMANAL),
        ("Descongelar y desinfectar", Frecuencia.MENSUAL),
    ],
    "Limpieza de depósito": [
        ("Barrer y ordenar estanterías", Frecuencia.SEMANAL),
        ("Control de vencimientos", Frecuencia.QUINCENAL),
    ],
    "Limpieza de salón de venta": [
        ("Limpiar mostradores", Frecuencia.DIARIA),
        ("Limpiar vidrieras", Frecuencia.SEMANAL),
    ],
    "Higiene de sanitarios y vestuarios": [
        ("Limpiar y desinfectar baños", Frecuencia.DIARIA),
        ("Reponer insumos de higiene", Frecuencia.SEMANAL),
    ],
    "Limpieza de equipos de refrigeración": [
        ("Limpiar bandejas de heladera", Frecuencia.SEMANAL),
        ("Desinfección externa de freezers", Frecuencia.QUINCENAL),
    ],
    "Control de plagas": [
        ("Inspección de trampas", Frecuencia.SEMANAL),
        ("Revisión de cebos", Frecuencia.MENSUAL),
    ],
}


def generar_tareas(db) -> list[Tarea]:
    planes = db.scalars(select(PlanLimpieza)).all()
    tareas = []
    for plan in planes:
        for nombre, frecuencia in TAREAS_POR_PLAN.get(plan.nombre, []):
            tareas.append(
                Tarea(nombre=nombre, frecuencia=frecuencia, plan_limpieza_id=plan.id)
            )
    return tareas


def main():
    db = SessionLocal()
    try:
        tareas = generar_tareas(db)
        if not tareas:
            print("No hay planes de limpieza cargados. Correr antes scripts.seed_planes_limpieza.")
            return

        db.add_all(tareas)
        db.commit()

        print(f"Se insertaron {len(tareas)} tareas.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
