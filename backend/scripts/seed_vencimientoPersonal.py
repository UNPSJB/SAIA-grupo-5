# scripts/seed_vencimientoPersonal.py
"""
Pobla la base con Tipos de Vencimiento y una tanda de VencimientoPersonal
de ejemplo, con una mezcla deliberada de vencidos, próximos a vencer y
vigentes por un buen rato -- para poder probar la alerta de "Vencimientos
de Personal" sin tener que cargar datos a mano.

Requiere haber corrido antes:
1. python -m scripts.seed_personal (al menos una persona cargada)

Uso: python -m scripts.seed_vencimientoPersonal
"""
from datetime import date, timedelta

from faker import Faker

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.personal.models import Persona
from src.tipos_vencimientos.models import TipoVencimiento
from src.vencimiento_personal.models import VencimientoPersonal

fake = Faker("es_AR")
Faker.seed(42)

TIPOS_VENCIMIENTOS = [
    ("Carnet de manipulador de alimentos", "Habilitación para manipular alimentos, exigida por el municipio."),
    ("Apto médico", "Certificado médico de aptitud para trabajar en la planta."),
    ("Capacitación en BPM", "Capacitación periódica en Buenas Prácticas de Manufactura."),
    ("Libreta sanitaria", "Libreta sanitaria vigente requerida para manipulación de alimentos."),
]

# (tipo, dias_desde_que_empieza_a_regir, dias_hasta_el_vencimiento_desde_hoy -- puede ser negativo)
VENCIMIENTOS = [
    ("Carnet de manipulador de alimentos", 355, 10),    # próximo a vencer
    ("Apto médico", 400, -5),                            # ya vencido
    ("Capacitación en BPM", 100, 90),                    # vigente, lejos de vencer
    ("Libreta sanitaria", 300, 2),                       # vence en un par de días
    ("Carnet de manipulador de alimentos", 200, 200),    # vigente, lejos de vencer
    ("Apto médico", 350, 20),                            # próximo a vencer
    ("Libreta sanitaria", 500, -40),                     # vencido hace rato
]


def generar_tipos_vencimientos(db) -> dict[str, TipoVencimiento]:
    tipos = {nombre: TipoVencimiento(nombre=nombre, descripcion=descripcion) for nombre, descripcion in TIPOS_VENCIMIENTOS}
    db.add_all(tipos.values())
    db.flush()  # necesitamos el id de cada tipo antes de crear los vencimientos
    return tipos


def generar_vencimientos(db, tipos: dict[str, TipoVencimiento]) -> list[VencimientoPersonal]:
    personas = db.query(Persona).filter(Persona.activo == True).all()
    if not personas:
        return []

    hoy = date.today()
    cantidad = min(len(VENCIMIENTOS), len(personas))
    personas_elegidas = fake.random_elements(elements=personas, length=cantidad, unique=True)

    vencimientos = []
    for persona, (tipo_nombre, dias_desde, dias_hasta_vencer) in zip(personas_elegidas, VENCIMIENTOS):
        vencimientos.append(
            VencimientoPersonal(
                persona_id=persona.id,
                tipo_vencimiento_id=tipos[tipo_nombre].id,
                fecha_desde=hoy - timedelta(days=dias_desde),
                fecha_hasta=hoy + timedelta(days=dias_hasta_vencer),
                es_actual=True,
            )
        )

    return vencimientos


def main():
    db = SessionLocal()
    try:
        tipos = generar_tipos_vencimientos(db)
        vencimientos = generar_vencimientos(db, tipos)

        if not vencimientos:
            print("No hay personal cargado. Correr antes scripts.seed_personal.")
            return

        db.add_all(vencimientos)
        db.commit()

        print(f"Se insertaron {len(tipos)} tipos de vencimiento y {len(vencimientos)} vencimientos de personal.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
