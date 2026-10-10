# scripts/seed_incidentes.py
"""
Pobla la base con Tipos de Incidente y una tanda de Incidentes de ejemplo
(rotura de equipo, hallazgo de plaga, devolución de cliente, desvío de
procedimiento), con una mezcla de incidentes abiertos y cerrados.

GET /incidentes, /incidentes/abiertos y /incidentes/cerrados filtran
directamente por Incidente.estado (ver services.listar_incidentes_abiertos
/ _cerrados), así que alcanza con setear ese campo. Para que las pantallas
de "Acción correctiva" e "Historial" tengan datos reales para mostrar, este
seed además crea, para cada incidente que nace cerrado:
  - una AccionCorrectiva activa vinculada al incidente.
  - los eventos de HistorialIncidente correspondientes (CREADO y CERRADO),
    igual que lo haría el flujo real (crear_incidente / crear_accion_correctiva).

Requiere haber corrido antes:
1. python -m scripts.seed_personal (al menos una persona cargada)
2. python -m scripts.seed_sectores (opcional, para los incidentes con sector)

Uso: python -m scripts.seed_incidentes
"""
from datetime import datetime, timedelta

from faker import Faker
from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.incidentes.models import Incidente
from src.incidentes.constants import EstadoIncidente
from src.accion_correctiva.models import AccionCorrectiva
from src.historial_incidente.models import HistorialIncidente
from src.historial_incidente.constants import TipoEvento
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

# (nombre, descripcion, tipo, sector|None, dias_desde_apertura, estado, dias_desde_cierre|None,
#  accion_correctiva|None -> (titulo, detalle) si el incidente está cerrado)
INCIDENTES = [
    (
        "Pérdida de frío en freezer 2",
        "Se detectó que el freezer 2 no mantiene la temperatura adecuada, posible falla del compresor.",
        "Rotura de equipo", "Equipos de frío", 2, EstadoIncidente.ABIERTO, None, None,
    ),
    (
        "Cinta transportadora de fiambrería trabada",
        "La cinta de la cortadora de fiambre dejó de avanzar durante el uso.",
        "Rotura de equipo", "Fiambrería", 10, EstadoIncidente.CERRADO, 8,
        ("Reparación de la cinta transportadora", "Se destrabó el mecanismo, se lubricó la cinta y se verificó el funcionamiento correcto."),
    ),
    (
        "Roedor detectado en depósito",
        "Se encontraron excrementos de roedor cerca de las estanterías del depósito.",
        "Hallazgo de plaga", "Depósito", 1, EstadoIncidente.ABIERTO, None, None,
    ),
    (
        "Rastros de insectos cerca de bolsas de harina",
        "Se observaron indicios de insectos en el sector de almacenamiento de harina.",
        "Hallazgo de plaga", "Elaboración", 20, EstadoIncidente.CERRADO, 18,
        ("Fumigación y reubicación de insumos", "Se contactó a la empresa de control de plagas y se reubicaron las bolsas de harina sobre tarimas."),
    ),
    (
        "Hallazgo de cucarachas en sector lavandín",
        "Se detectaron cucarachas al mover los elementos de limpieza del lavandín.",
        "Hallazgo de plaga", "Sector lavandín", 5, EstadoIncidente.ABIERTO, None, None,
    ),
    (
        "Devolución de milanesas por cliente - lote 112",
        "Un cliente devolvió el producto indicando sabor rancio.",
        "Devolución de cliente", "Salón de ventas", 3, EstadoIncidente.ABIERTO, None, None,
    ),
    (
        "Cliente reporta olor extraño en fiambre cortado",
        "Reclamo recibido por teléfono sobre olor extraño en jamón cocido.",
        "Devolución de cliente", "Fiambrería", 15, EstadoIncidente.CERRADO, 13,
        ("Verificación y descarte de lote", "Se retiró el lote de la venta y se verificó la cadena de frío del producto."),
    ),
    (
        "Reclamo por producto vencido en góndola",
        "Un cliente encontró un producto con la fecha de vencimiento superada.",
        "Devolución de cliente", "Salón de ventas", 1, EstadoIncidente.ABIERTO, None, None,
    ),
    (
        "Operario sin cofia durante manipulación",
        "Se observó a un operario manipulando alimentos sin el elemento de protección correspondiente.",
        "Desvío de procedimiento", "Elaboración", 7, EstadoIncidente.CERRADO, 6,
        ("Recordatorio de procedimiento al operario", "Se recordó al operario el uso obligatorio de cofia y se reforzó la capacitación."),
    ),
    (
        "Superficie de corte sin desinfectar antes de uso",
        "La mesada de corte no fue desinfectada antes de iniciar las tareas.",
        "Desvío de procedimiento", None, 4, EstadoIncidente.ABIERTO, None, None,
    ),
]


def generar_tipos_incidentes(db) -> dict[str, TipoIncidente]:
    tipos = {nombre: TipoIncidente(nombre=nombre, descripcion=descripcion) for nombre, descripcion in TIPOS_INCIDENTES}
    db.add_all(tipos.values())
    db.flush()  # necesitamos el id de cada tipo antes de crear los incidentes
    return tipos


def generar_incidentes(db, tipos: dict[str, TipoIncidente]) -> list[tuple[Incidente, tuple[str, str] | None]]:
    operarios = db.scalars(select(Persona).where(Persona.activo == True)).all()
    if not operarios:
        return []

    sectores = {s.nombre: s for s in db.scalars(select(Sector)).all()}

    hoy = datetime.now()
    pares = []

    for nombre, descripcion, tipo_nombre, sector_nombre, dias_abierto, estado, dias_cerrado, accion_correctiva in INCIDENTES:
        operario = fake.random_element(elements=operarios)
        sector = sectores.get(sector_nombre) if sector_nombre else None

        incidente = Incidente(
            nombre=nombre,
            descripcion=descripcion,
            fecha_abierto=hoy - timedelta(days=dias_abierto),
            fecha_cierre=hoy - timedelta(days=dias_cerrado) if dias_cerrado is not None else None,
            estado=estado,
            tipo_id=tipos[tipo_nombre].id,
            operario_id=operario.id,
            sector_id=sector.id if sector else None,
        )
        pares.append((incidente, accion_correctiva))

    return pares


def generar_historial(db, pares: list[tuple[Incidente, tuple[str, str] | None]]) -> list[AccionCorrectiva]:
    acciones = []

    for incidente, accion_correctiva in pares:
        db.add(
            HistorialIncidente(
                incidente_id=incidente.id,
                tipo_evento=TipoEvento.CREADO,
                fecha_evento=incidente.fecha_abierto,
                usuario_id=incidente.operario_id,
            )
        )

        if accion_correctiva is None:
            continue

        titulo, detalle = accion_correctiva
        descripcion = f"{titulo}. {detalle}"

        _accion = AccionCorrectiva(
            descripcion=descripcion,
            fecha=incidente.fecha_cierre,
            incidente_id=incidente.id,
            persona_id=incidente.operario_id,
        )
        db.add(_accion)
        db.flush()  # necesitamos el id de la accion correctiva para el evento de historial

        db.add(
            HistorialIncidente(
                incidente_id=incidente.id,
                tipo_evento=TipoEvento.CERRADO,
                fecha_evento=incidente.fecha_cierre,
                usuario_id=incidente.operario_id,
                descripcion=descripcion,
                accion_correctiva_id=_accion.id,
            )
        )
        acciones.append(_accion)

    return acciones


def main():
    db = SessionLocal()
    try:
        tipos = generar_tipos_incidentes(db)
        pares = generar_incidentes(db, tipos)

        if not pares:
            print("No hay personal cargado. Correr antes scripts.seed_personal.")
            return

        incidentes = [incidente for incidente, _ in pares]
        db.add_all(incidentes)
        db.flush()  # necesitamos el id de cada incidente antes de crear su historial

        acciones = generar_historial(db, pares)
        db.commit()

        abiertos = sum(1 for i in incidentes if i.estado == EstadoIncidente.ABIERTO)
        cerrados = len(incidentes) - abiertos
        print(
            f"Se insertaron {len(tipos)} tipos de incidente, {len(incidentes)} incidentes "
            f"({abiertos} abiertos, {cerrados} cerrados) y {len(acciones)} acciones correctivas."
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()
