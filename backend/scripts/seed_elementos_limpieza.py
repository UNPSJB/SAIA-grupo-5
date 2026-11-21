# scripts/seed_elementos_limpieza.py
"""
Uso: python -m scripts.seed_elementos_limpieza
"""
from datetime import date, timedelta

from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.elementosLimpieza.models import ElementoLimpieza, TipoElementoLimpieza

TIPOS = [
    ("Cepillos", "CEP"),
    ("Trapos y paños", "TRP"),
    ("Escobillones", "ESC"),
    ("Mopas", "MOP"),
    ("Guantes", "GUA"),
]

ELEMENTOS = [
    ("Cepillo de cerdas duras", "Cepillos", 15, "Elaboración", 20),
    ("Cepillo para pisos", "Cepillos", 30, "Depósito", 27),
    ("Cepillo para superficies inox", "Cepillos", 45, "Equipos de frío", 10),
    ("Trapo rejilla", "Trapos y paños", 7, "Elaboración", 10),
    ("Paño microfibra", "Trapos y paños", 15, "Salón de ventas", 15),
    ("Trapo para mesadas", "Trapos y paños", 10, "Gabinetes higiénicos y vestuarios", 12),
    ("Escobillón de mano", "Escobillones", 20, "Fiambrería", 18),
    ("Escobillón de cerda", "Escobillones", 30, "Rotisería", 5),
    ("Mopa húmeda", "Mopas", 30, "Depósito", 1),
    ("Mopa seca", "Mopas", 20, "Oficinas y pasillos", 40),
    ("Guantes de goma", "Guantes", 10, "Fiambrería", 8),
    ("Guantes descartables (caja)", "Guantes", 3, "Rotisería", 1),
]


def generar_tipos(db) -> tuple[dict[str, TipoElementoLimpieza], int]:
    # Idempotente: nombre y prefijo son UNIQUE, así que se crean solo los que faltan.
    tipos = {t.nombre: t for t in db.scalars(select(TipoElementoLimpieza)).all()}
    nuevos = [
        TipoElementoLimpieza(nombre=nombre, prefijo=prefijo)
        for nombre, prefijo in TIPOS
        if nombre not in tipos
    ]
    db.add_all(nuevos)
    db.flush()
    tipos.update({t.nombre: t for t in nuevos})
    return tipos, len(nuevos)


def generar_elementos(db, tipos: dict[str, TipoElementoLimpieza]) -> list[ElementoLimpieza]:
    hoy = date.today()
    contadores: dict[str, int] = {}
    elementos = []

    # Idempotente: se omiten los elementos ya cargados y la numeración de los
    # códigos continúa desde el último código existente de cada prefijo.
    existentes = list(db.scalars(select(ElementoLimpieza)).all())
    nombres_existentes = {e.nombre for e in existentes}
    for existente in existentes:
        prefijo, _, numero = existente.codigo.partition("-")
        if numero.isdigit():
            contadores[prefijo] = max(contadores.get(prefijo, 0), int(numero))

    for nombre, nombre_tipo, frecuencia, ubicacion, dias_desde_alta in ELEMENTOS:
        if nombre in nombres_existentes:
            continue
        tipo = tipos[nombre_tipo]
        contadores[tipo.prefijo] = contadores.get(tipo.prefijo, 0) + 1
        codigo = f"{tipo.prefijo}-{contadores[tipo.prefijo]:03d}"

        elementos.append(
            ElementoLimpieza(
                codigo=codigo,
                nombre=nombre,
                tipo_id=tipo.id,
                ubicacion=ubicacion,
                frecuencia_recambio=frecuencia,
                fecha_alta=hoy - timedelta(days=dias_desde_alta),
            )
        )

    return elementos


def main():
    db = SessionLocal()
    try:
        tipos, tipos_nuevos = generar_tipos(db)
        elementos = generar_elementos(db, tipos)

        db.add_all(elementos)
        db.commit()

        print(f"Se insertaron {tipos_nuevos} tipos y {len(elementos)} elementos de limpieza.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
