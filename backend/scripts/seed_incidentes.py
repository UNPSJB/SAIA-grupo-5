# scripts/seed_incidentes.py
"""
Pobla la base con Tipos de Incidente y una tanda de Incidentes de ejemplo
(rotura de equipo, hallazgo de plaga, devolución de cliente, incumplimiento
de procedimiento), con una mezcla de incidentes abiertos y cerrados.

No crea AccionCorrectiva ni HistorialIncidente -- son datos insertados
directo por ORM (no pasan por los services), así que los incidentes
"Cerrado" quedan sin la acción correctiva / el evento de historial que el
flujo real de la app generaría. Si hace falta ese rastro completo para
probar esas pantallas, es un seed aparte.

Requiere haber corrido antes:
1. python -m scripts.seed_personal (al menos una persona cargada)
2. python -m scripts.seed_sectores (opcional, para los incidentes con sector)

Uso: python -m scripts.seed_incidentes
"""
from datetime import datetime, timedelta

from faker import Faker

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.incidentes.models import Incidente
from src.incidentes.constants import EstadoIncidente
from src.tipo_incidente.models import TipoIncidente
from src.personal.models import Persona
from src.sector.models import Sector

fake = Faker("es_AR")
Faker.seed(42)

TIPOS_INCIDENTES = [
    ("Rotura de equipo", "Fallas o roturas de equipos e infraestructura que afectan la inocuidad."),
    ("Hallazgo de plaga", "Presencia o indicios de plagas (roedores, insectos) en el establecimiento."),
    ("Devolución de cliente", "Reclamos o devoluciones de productos por parte de clientes."),
    ("Desvío de procedimiento", "Desvíos respecto de un procedimiento de limpieza o manipulación establecido."),
]

# (nombre, descripcion, tipo, sector|None, dias_desde_apertura, estado, dias_desde_cierre|None)
INCIDENTES = [
    ("Pérdida de frío en freezer 2", "Se detectó que el freezer 2 no mantiene la temperatura adecuada, posible falla del compresor.", "Rotura de equipo", "Equipos de frío", 2, EstadoIncidente.ABIERTO, None),
    ("Cinta transportadora de fiambrería trabada", "La cinta de la cortadora de fiambre dejó de avanzar durante el uso.", "Rotura de equipo", "Fiambrería", 10, EstadoIncidente.CERRADO, 8),
    ("Roedor detectado en depósito", "Se encontraron excrementos de roedor cerca de las estanterías del depósito.", "Hallazgo de plaga", "Depósito", 1, EstadoIncidente.ABIERTO, None),
    ("Rastros de insectos cerca de bolsas de harina", "Se observaron indicios de insectos en el sector de almacenamiento de harina.", "Hallazgo de plaga", "Elaboración", 20, EstadoIncidente.CERRADO, 18),
    ("Hallazgo de cucarachas en sector lavandín", "Se detectaron cucarachas al mover los elementos de limpieza del lavandín.", "Hallazgo de plaga", "Sector lavandín", 5, EstadoIncidente.ABIERTO, None),
    ("Devolución de milanesas por cliente - lote 112", "Un cliente devolvió el producto indicando sabor rancio.", "Devolución de cliente", "Salón de ventas", 3, EstadoIncidente.ABIERTO, None),
    ("Cliente reporta olor extraño en fiambre cortado", "Reclamo recibido por teléfono sobre olor extraño en jamón cocido.", "Devolución de cliente", "Fiambrería", 15, EstadoIncidente.CERRADO, 13),
    ("Reclamo por producto vencido en góndola", "Un cliente encontró un producto con la fecha de vencimiento superada.", "Devolución de cliente", "Salón de ventas", 1, EstadoIncidente.ABIERTO, None),
    ("Operario sin cofia durante manipulación", "Se observó a un operario manipulando alimentos sin el elemento de protección correspondiente.", "Desvío de procedimiento", "Elaboración", 7, EstadoIncidente.CERRADO, 6),
    ("Superficie de corte sin desinfectar antes de uso", "La mesada de corte no fue desinfectada antes de iniciar las tareas.", "Desvío de procedimiento", None, 4, EstadoIncidente.ABIERTO, None),
]


def generar_tipos_incidentes(db) -> dict[str, TipoIncidente]:
    tipos = {nombre: TipoIncidente(nombre=nombre, descripcion=descripcion) for nombre, descripcion in TIPOS_INCIDENTES}
    db.add_all(tipos.values())
    db.flush()  # necesitamos el id de cada tipo antes de crear los incidentes
    return tipos


def generar_incidentes(db, tipos: dict[str, TipoIncidente]) -> list[Incidente]:
    operarios = db.query(Persona).filter(Persona.activo == True).all()
    if not operarios:
        return []

    sectores = {s.nombre: s for s in db.query(Sector).all()}

    hoy = datetime.now()
    incidentes = []

    for nombre, descripcion, tipo_nombre, sector_nombre, dias_abierto, estado, dias_cerrado in INCIDENTES:
        operario = fake.random_element(elements=operarios)
        sector = sectores.get(sector_nombre) if sector_nombre else None

        incidentes.append(
            Incidente(
                nombre=nombre,
                descripcion=descripcion,
                fecha_abierto=hoy - timedelta(days=dias_abierto),
                fecha_cierre=hoy - timedelta(days=dias_cerrado) if dias_cerrado is not None else None,
                estado=estado,
                tipo_id=tipos[tipo_nombre].id,
                operario_id=operario.id,
                sector_id=sector.id if sector else None,
            )
        )

    return incidentes


def main():
    db = SessionLocal()
    try:
        tipos = generar_tipos_incidentes(db)
        incidentes = generar_incidentes(db, tipos)

        if not incidentes:
            print("No hay personal cargado. Correr antes scripts.seed_personal.")
            return

        db.add_all(incidentes)
        db.commit()

        abiertos = sum(1 for i in incidentes if i.estado == EstadoIncidente.ABIERTO)
        cerrados = len(incidentes) - abiertos
        print(f"Se insertaron {len(tipos)} tipos de incidente y {len(incidentes)} incidentes ({abiertos} abiertos, {cerrados} cerrados).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
