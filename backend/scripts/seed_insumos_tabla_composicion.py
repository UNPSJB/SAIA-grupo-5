"""
Puebla la base de datos con insumos y su información nutricional a partir de una tabla de
composición de alimentos en CSV (columnas: Codigo, Alimento, UnidadMedida, Decimales,
FactorCorreccion, Id, Agua, E, Prot, Lip, HCtotal, HCdisp, Fibra, Cen, Na, K, Ca, P, Fe, Zn,
B1, B2, Niac, Folatos, VitA, VitB12, VitC, AGSat, AGMI, AGPI, Colesterol, VitD, B1_fort,
B2_fort, Fe_fort, Niac_for, Fola_for).

Se excluyen las filas cuyo Codigo no empieza con "A": en esta fuente, los códigos "S00x"
son micronutrientes elementales sueltos (hierro, ácido fólico, vitamina A/D/B12 "elemental"),
no insumos de receta reales.

LIMITACIONES DE LA FUENTE — leer antes de correr esto en algo que no sea desarrollo/pruebas:

1. La tabla NO trae azúcares (ni totales ni añadidos) ni grasas trans para ningún alimento.
   Esos tres campos quedan en 0 para TODOS los insumos cargados acá. "0" acá significa
   "sin dato en la fuente", no "sin azúcar" — para alimentos como miel, dulce de leche o
   mermelada esto es claramente incorrecto. No usar esta carga para calcular sellos de
   advertencia reales sin completar esos valores a mano.
2. El CSV trae 327 alimentos de referencia "gramos" y 46 "mililitros" (líquidos). Acá se
   tratan todos como valores "cada 100 g", siguiendo la misma convención de densidad ≈ 1
   que ya usa scripts/seed_insumos.py (ver su comentario sobre insumos alimentarios en
   unidades de masa). Para un líquido con densidad bien distinta de 1 (aceites, por
   ejemplo) esto es una aproximación, no un dato exacto.
3. La unidad de STOCK de cada insumo (Insumo.unidad_medida_id, distinta de la base "cada
   100 g" de la info nutricional) se asigna a "Kilogramo" por defecto para los 373
   insumos, porque el CSV no indica cómo se maneja cada uno en depósito. Conviene
   revisarla caso por caso antes de usar esto para recetas reales.
4. FuenteNutricional.origen queda con un TODO: no tengo forma de confirmar la procedencia
   exacta de este CSV, así que preferí dejarlo marcado en vez de inventar una cita.
5. Este script NO completa los campos nutricionales planos que scripts/seed_insumos.py
   todavía pasa al crear un Insumo (valor_energetico, azucares_anadidos, grasas_totales,
   grasas_saturadas, sodio, peso_unidad) — asume que esos campos son legacy/opcionales
   ahora que existe InformacionNutricionalInsumo. Si Insumo todavía los exige como no
   nulos sin default, la creación va a fallar: revisá el modelo antes de correr esto.

Requiere: seed_personal (un administrador activo) y que ya existan las unidades de medida
estándar (Kilogramo, Gramo, ...). No requiere haber corrido scripts/seed_insumos.py.

Uso: copiá el CSV a scripts/data/alimento_y_composicion.csv y corré
    python -m scripts.seed_insumos_tabla_composicion
"""

import csv
import re
from datetime import datetime
from decimal import Decimal
from pathlib import Path

from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.fuente_nutricional.models import FuenteNutricional
from src.informacion_nutricional_insumo.models import InformacionNutricionalInsumo
from src.insumos.models import Insumo
from src.personal.models import Persona
from src.unidad_medida.models import UnidadMedida

RUTA_CSV = Path(__file__).resolve().parent / "data" / "alimento_y_composicion.csv"

# None = cargar todas las filas del CSV (373 insumos). Poné un número chico para probar rápido.
LIMITE_FILAS: int | None = None

UNIDAD_STOCK_POR_DEFECTO = "Kilogramo"
MARCA_POR_DEFECTO = "Sin marca"  # misma convención que scripts/seed_insumos.py

FUENTE = {
    "nombre": "Tabla de composición de alimentos (CSV importado)",
    "descripcion": (
        f"Valores nutricionales por 100 g/ml importados desde {RUTA_CSV.name}. "
        "Sin azúcares ni grasas trans en la fuente original: esos tres campos quedan en 0 "
        "para todos los registros cargados por este script."
    ),
    # TODO: completar con la procedencia real del CSV (institución, año, link) antes de usar
    # estos datos para algo más que desarrollo/pruebas.
    "origen": "TODO: completar procedencia real de la tabla",
    "licencia_uso": "Uso interno para desarrollo y pruebas. No usar para rotulado real.",
    "formato_uso": "Valores cada 100 g de producto. Energía en kcal, nutrientes en g y sodio en mg.",
}


LARGO_MAXIMO_NOMBRE = 40  # Insumo.nombre es String(40) y el schema valida max_length=40
SEPARADORES_NOMBRE = re.compile(r" / | ó | \(| \+")


def nombre_insumo(alimento: str) -> str:
    """Nombre del insumo a partir del alimento del CSV, recortado al largo permitido.

    Algunos alimentos listan variantes ("Bizcochos de grasa / Mantecado / ...") o
    aclaraciones entre paréntesis: se queda con la primera variante.
    """
    nombre = alimento.strip()
    if len(nombre) > LARGO_MAXIMO_NOMBRE:
        nombre = SEPARADORES_NOMBRE.split(nombre)[0].strip()
    return nombre[:LARGO_MAXIMO_NOMBRE].strip()


def renombrar_insumos_largos(db, filas: list[dict[str, str]]) -> int:
    """Corrige los insumos que una versión anterior de este seed guardó con el nombre completo."""
    largos = {fila["Alimento"]: nombre_insumo(fila["Alimento"]) for fila in filas
              if len(fila["Alimento"]) > LARGO_MAXIMO_NOMBRE}
    insumos = db.scalars(select(Insumo).where(Insumo.nombre.in_(largos))).all()
    for insumo in insumos:
        insumo.nombre = largos[insumo.nombre]
    return len(insumos)


def _decimal(valor: str) -> Decimal:
    # el CSV trae floats en notación científica con ruido de precisión
    # (ej: "3.6297000000000003e+02"); redondeamos antes de pasar a Decimal.
    return Decimal(str(round(float(valor), 2)))


def _administrador(db) -> Persona:
    administrador = db.scalars(
        select(Persona).where(Persona.administrar.is_(True), Persona.activo.is_(True)).order_by(Persona.id)
    ).first()
    if administrador is None:
        raise ValueError("No hay un administrador activo. Corré seed_personal primero.")
    return administrador


def _obtener_o_crear_fuente(db, administrador: Persona) -> FuenteNutricional:
    fuente = db.scalars(select(FuenteNutricional).where(FuenteNutricional.nombre == FUENTE["nombre"])).first()
    if fuente is None:
        fuente = FuenteNutricional(
            **FUENTE,
            licencia_verificada=False,  # no verificada: ver TODO de "origen" arriba
            activo=True,
            verificada_por_id=administrador.id,
            fecha_verificacion=datetime.now(),
        )
        db.add(fuente)
        db.flush()
    return fuente


def _unidad_stock(db) -> UnidadMedida:
    unidad = db.scalars(select(UnidadMedida).where(UnidadMedida.nombre == UNIDAD_STOCK_POR_DEFECTO)).first()
    if unidad is None:
        raise ValueError(
            f"No existe la unidad de medida '{UNIDAD_STOCK_POR_DEFECTO}'. "
            "Cargá las unidades estándar antes de correr este script."
        )
    return unidad


def _leer_filas_csv() -> list[dict[str, str]]:
    if not RUTA_CSV.exists():
        raise FileNotFoundError(f"No encontré el CSV en {RUTA_CSV}. Copialo ahí antes de correr el script.")

    with RUTA_CSV.open(encoding="utf-8") as archivo:
        filas = [fila for fila in csv.DictReader(archivo) if fila["Codigo"].startswith("A")]

    if LIMITE_FILAS is not None:
        filas = filas[:LIMITE_FILAS]
    return filas


def _valores_nutricionales(fila: dict[str, str]) -> dict[str, Decimal]:
    valores = {
        "valor_energetico": _decimal(fila["E"]),
        "carbohidratos": _decimal(fila["HCtotal"]),
        "azucares_totales": Decimal("0"),   # sin dato en la fuente — ver limitación 1
        "azucares_anadidos": Decimal("0"),  # ídem
        "proteinas": _decimal(fila["Prot"]),
        "grasas_totales": _decimal(fila["Lip"]),
        "grasas_saturadas": _decimal(fila["AGSat"]),
        "grasas_trans": Decimal("0"),       # sin dato en la fuente — ver limitación 1
        "fibra_alimentaria": _decimal(fila["Fibra"]),
        "sodio": _decimal(fila["Na"]),
    }

    # Mismas reglas que informacion_nutricional_insumo.services._validar_reglas_nutricionales
    if valores["azucares_anadidos"] > valores["azucares_totales"]:
        raise ValueError(f"{fila['Alimento']}: los azúcares añadidos superan a los totales.")
    if valores["azucares_totales"] > valores["carbohidratos"]:
        raise ValueError(f"{fila['Alimento']}: los azúcares totales superan a los carbohidratos.")
    if valores["grasas_saturadas"] + valores["grasas_trans"] > valores["grasas_totales"]:
        raise ValueError(f"{fila['Alimento']}: saturadas + trans superan a las grasas totales.")
    return valores


def generar_insumos(db, filas: list[dict[str, str]]) -> list[Insumo]:
    unidad = _unidad_stock(db)
    existentes = {insumo.nombre for insumo in db.scalars(select(Insumo)).all()}

    return [
        Insumo(
            nombre=nombre_insumo(fila["Alimento"]),
            marca=MARCA_POR_DEFECTO,
            unidad_medida_id=unidad.id,
            activo=True,
        )
        for fila in filas
        if nombre_insumo(fila["Alimento"]) not in existentes
    ]


def generar_informacion_nutricional(
    db, filas: list[dict[str, str]], administrador: Persona, fuente: FuenteNutricional
) -> list[InformacionNutricionalInsumo]:
    con_informacion = set(db.scalars(
        select(InformacionNutricionalInsumo.insumo_id).where(InformacionNutricionalInsumo.insumo_id.is_not(None))
    ).all())

    por_nombre = {nombre_insumo(fila["Alimento"]): fila for fila in filas}
    insumos = db.scalars(
        select(Insumo).where(Insumo.tipo_herencia == "general", Insumo.nombre.in_(por_nombre))
    ).all()

    ahora = datetime.now()
    return [
        InformacionNutricionalInsumo(
            insumo_id=insumo.id,
            **_valores_nutricionales(por_nombre[insumo.nombre]),
            fuente_nutricional_id=fuente.id,
            referencia_fuente=f"{insumo.nombre} ({por_nombre[insumo.nombre]['Codigo']}) - valores cada 100 g",
            cargada_por_id=administrador.id,
            fecha_carga=ahora,
            modificado=False,
        )
        for insumo in insumos
        if insumo.id not in con_informacion
    ]


def main():
    filas = _leer_filas_csv()
    db = SessionLocal()

    try:
        administrador = _administrador(db)
        fuente = _obtener_o_crear_fuente(db, administrador)

        renombrados = renombrar_insumos_largos(db, filas)
        if renombrados:
            print(f"Se acortó el nombre de {renombrados} insumos que superaban los {LARGO_MAXIMO_NOMBRE} caracteres.")
        db.flush()

        insumos = generar_insumos(db, filas)
        db.add_all(insumos)
        db.flush()  # necesitamos insumo.id antes de generar la info nutricional

        informacion = generar_informacion_nutricional(db, filas, administrador, fuente)
        db.add_all(informacion)

        db.commit()
        print(
            f"Se insertaron {len(insumos)} insumos y "
            f"{len(informacion)} registros de información nutricional."
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()