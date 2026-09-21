# scripts/seed_tareas.py
"""
Pobla la base de datos con tareas basadas en procedimientos POES reales
(guía práctica de POES, sección 5.2), asignadas a los planes de limpieza
ya existentes.
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
    "Limpieza de instalaciones - Elaboración": [
        {
            "nombre": "Limpiar pisos, zócalos, desagües y rejillas",
            "frecuencia": Frecuencia.DIARIA,
            "descripcion": (
                "Retirar utensilios y materiales del área, recoger los residuos sólidos, "
                "aplicar detergente/desengrasante y cepillar, enjuagar con agua potable, "
                "aplicar desinfectante y dejar actuar 15 minutos antes de reiniciar las actividades."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpiar paredes, revestimientos y aberturas",
            "frecuencia": Frecuencia.DIARIA,
            "descripcion": (
                "Eliminar polvo y salpicaduras de paredes, revestimientos y aberturas, aplicar "
                "solución detergente con paño o cepillo, enjuagar y desinfectar."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpiar techos, luces y estructuras aéreas",
            "frecuencia": Frecuencia.MENSUAL,
            "descripcion": (
                "Remover telarañas y polvo acumulado en techos y estructuras aéreas, limpiar "
                "luminarias con paño húmedo y verificar ausencia de condensación."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": "Repetir la limpieza si se detecta acumulación de residuos o condensación",
        },
        {
            "nombre": "Limpiar mesadas y útiles de trabajo",
            "frecuencia": Frecuencia.DIARIA,
            "descripcion": (
                "Retirar restos de alimentos y utensilios, lavar con detergente, enjuagar con "
                "agua potable y aplicar desinfectante sobre toda la superficie de contacto directo."
            ),
            "foto_obligatoria": True,
            "accion_correctiva": "Repetir el lavado y la desinfección antes de reanudar la manipulación de alimentos",
        },
    ],
    "Limpieza cortadora de fiambre": [
        {
            "nombre": "Limpieza diaria de cortadora",
            "frecuencia": Frecuencia.DIARIA,
            "descripcion": (
                "Desconectar la máquina de la energía eléctrica, retirar residuos de alimentos, "
                "desarmar las partes desmontables (cuchilla, protector, bandeja), aplicar detergente "
                "desengrasante, enjuagar con agua potable y aplicar desinfectante sobre todas las "
                "superficies de contacto directo con el alimento."
            ),
            "foto_obligatoria": True,
            "accion_correctiva": "Repetir el procedimiento completo y verificar antes de continuar",
        },
    ],
    "Limpieza de equipos de frío": [
        {
            "nombre": "Limpieza diaria de heladeras y vitrinas",
            "frecuencia": Frecuencia.DIARIA,
            "descripcion": (
                "Retirar residuos y derrames, limpiar superficies internas y externas con paño "
                "húmedo y detergente, enjuagar, desinfectar y verificar la temperatura de funcionamiento."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpieza profunda semanal de heladeras",
            "frecuencia": Frecuencia.SEMANAL,
            "descripcion": (
                "Retirar y desarmar las partes internas removibles (estantes, bandejas, burletes), "
                "lavar con detergente, enjuagar, desinfectar y secar antes de recolocarlas; "
                "verificar el estado de burletes y desagües."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpieza superficial de cámaras",
            "frecuencia": Frecuencia.DIARIA,
            "descripcion": (
                "Barrer y retirar residuos del piso de la cámara, limpiar salpicaduras en paredes "
                "bajas y verificar ausencia de hielo o derrames."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpieza profunda semanal de cámaras",
            "frecuencia": Frecuencia.SEMANAL,
            "descripcion": (
                "Reubicar temporalmente los productos estibados, limpiar paredes, techo y piso con "
                "detergente desengrasante, enjuagar, desinfectar y ventilar antes de reingresar la "
                "mercadería."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": "Verificar que la cámara alcance nuevamente la temperatura adecuada antes de reingresar la mercadería",
        },
    ],
    "Limpieza de ductos y tuberías": [
        {
            "nombre": "Limpiar caños, tubos, ductos de ventilación",
            "frecuencia": Frecuencia.SEMANAL,
            "descripcion": (
                "Retirar la mercadería estibada en estanterías y racks cercanos, repasar caños, "
                "tubos y ductos de ventilación con un trapo húmedo."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Gestión de recipientes de residuos": [
        {
            "nombre": "Limpiar recipientes de residuos",
            "frecuencia": Frecuencia.DIARIA,
            "descripcion": (
                "Retirar las bolsas de residuos, aplicar detergente con esponja o cepillo, "
                "enjuagar y aplicar desinfectante."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Salón de ventas": [
        {
            "nombre": "Limpiar estanterías, estantes, racks",
            "frecuencia": Frecuencia.SEMANAL,
            "descripcion": "Retirar la mercadería estibada y repasar con un trapo húmedo.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Fiambrería - Útiles": [
        {
            "nombre": "Limpiar útiles",
            "frecuencia": Frecuencia.DIARIA,
            "descripcion": "Aplicar agua y detergente con esponja o cepillo, enjuagar con abundante agua.",
            "foto_obligatoria": True,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Fiambrería - Balanzas": [
        {
            "nombre": "Limpiar balanzas",
            "frecuencia": Frecuencia.DIARIA,
            "descripcion": (
                "Aplicar agua y detergente con trapo o esponja, enjuagar, aplicar desinfectante "
                "y enjuagar nuevamente."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Fiambrería - Mesadas de trabajo": [
        {
            "nombre": "Limpiar mesadas de trabajo",
            "frecuencia": Frecuencia.DIARIA,
            "descripcion": (
                "Retirar residuos sólidos, aplicar detergente, enjuagar y aplicar desinfectante."
            ),
            "foto_obligatoria": True,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Fiambrería - Piletas de lavado": [
        {
            "nombre": "Limpiar piletas de lavado",
            "frecuencia": Frecuencia.DIARIA,
            "descripcion": (
                "Retirar residuos sólidos, aplicar detergente, enjuagar y aplicar desinfectante."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Rotisería - Cocina": [
        {
            "nombre": "Limpiar cocina",
            "frecuencia": Frecuencia.DIARIA,
            "descripcion": (
                "Retirar residuos, desarmar partes (rejillas, hornallas), aplicar detergente, "
                "enjuagar y aplicar desinfectante."
            ),
            "foto_obligatoria": True,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Rotisería - Horno": [
        {
            "nombre": "Limpiar horno",
            "frecuencia": Frecuencia.SEMANAL,
            "descripcion": "Retirar residuos, retirar partes del equipo, aplicar detergente y enjuagar.",
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Rotisería - Fritador": [
        {
            "nombre": "Limpiar fritador",
            "frecuencia": Frecuencia.SEMANAL,
            "descripcion": (
                "Vaciar el aceite en un recipiente adecuado, desarmar partes, aplicar agua caliente "
                "y detergente, enjuagar y secar completamente."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": "Verificar temperatura del equipo antes de proceder a la limpieza para evitar siniestros laborales",
        },
    ],
    "Limpieza Rotisería - Campana y extractor": [
        {
            "nombre": "Limpiar campana y extractor",
            "frecuencia": Frecuencia.SEMANAL,
            "descripcion": (
                "Aplicar agua caliente y detergente/desengrasante, enjuagar, secar y verificar "
                "el filtro si existiera."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
    ],
    "Limpieza Rotisería - Mesadas y piletas": [
        {
            "nombre": "Limpiar mesadas de trabajo",
            "frecuencia": Frecuencia.DIARIA,
            "descripcion": (
                "Retirar residuos sólidos, aplicar detergente, enjuagar y aplicar desinfectante."
            ),
            "foto_obligatoria": True,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpiar piletas de lavado",
            "frecuencia": Frecuencia.DIARIA,
            "descripcion": (
                "Retirar residuos sólidos, aplicar detergente, enjuagar y aplicar desinfectante."
            ),
            "foto_obligatoria": False,
            "accion_correctiva": None,
        },
        {
            "nombre": "Limpiar útiles",
            "frecuencia": Frecuencia.DIARIA,
            "descripcion": "Aplicar agua y detergente con esponja o cepillo, enjuagar con abundante agua.",
            "foto_obligatoria": True,
            "accion_correctiva": None,
        },
    ],
}


def generar_tareas(db) -> list[Tarea]:
    planes = {p.nombre: p for p in db.scalars(select(PlanLimpieza)).all()}
    tareas = []
    for nombre_plan, lista_tareas in TAREAS_POR_PLAN.items():
        plan = planes.get(nombre_plan)
        if not plan:
            continue
        for datos in lista_tareas:
            tareas.append(
                Tarea(
                    nombre=datos["nombre"],
                    descripcion=datos["descripcion"],
                    frecuencia=datos["frecuencia"],
                    foto_obligatoria=datos["foto_obligatoria"],
                    accion_correctiva=datos["accion_correctiva"],
                    plan_limpieza_id=plan.id,
                )
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
