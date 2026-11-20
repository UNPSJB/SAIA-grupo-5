"""
Pobla la información nutricional de los insumos (tabla informacion_nutricional_insumos)
y la fuente nutricional de la que sale.

Requiere: seed_personal (un administrador activo), seed_insumos y seed_recetas.
Uso: python -m scripts.seed_informacion_nutricional
"""
from datetime import datetime
from decimal import Decimal

from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.fuente_nutricional.models import FuenteNutricional
from src.informacion_nutricional_insumo.constants import DATOS_NUTRICIONALES
from src.informacion_nutricional_insumo.models import InformacionNutricionalInsumo
from src.insumos.models import Insumo
from src.personal.models import Persona

FUENTE = {
    "nombre": "Valores de referencia SAIA (desarrollo)",
    "descripcion": "Valores nutricionales aproximados cargados por los scripts de seed para pruebas.",
    "origen": "Scripts de seed del proyecto (backend/scripts/seed_informacion_nutricional.py)",
    "licencia_uso": "Uso interno para desarrollo y pruebas. No usar para rotulado real.",
    "formato_uso": "Valores cada 100 g de producto. Energía en kcal, nutrientes en g y sodio en mg.",
}

# Orden de las tuplas = DATOS_NUTRICIONALES:
# (valor_energetico, carbohidratos, azucares_totales, azucares_anadidos, proteinas,
#  grasas_totales, grasas_saturadas, grasas_trans, fibra_alimentaria, sodio)
INFORMACION_NUTRICIONAL = {
    "Harina 000":            (364, 76, 0.3, 0, 10, 1.0, 0.2, 0, 2.7, 2),
    "Harina 0000":           (364, 76, 0.3, 0, 10, 1.0, 0.2, 0, 2.7, 2),
    "Azúcar":                (400, 100, 100, 100, 0, 0, 0, 0, 0, 0),
    "Sal fina":              (0, 0, 0, 0, 0, 0, 0, 0, 0, 38758),
    "Levadura fresca":       (105, 18, 0, 0, 8.4, 1.9, 0.2, 0, 8.1, 30),
    "Levadura seca":         (325, 41, 0, 0, 40, 7.6, 1.0, 0, 27, 51),
    "Manteca":               (717, 0.1, 0.1, 0, 0.9, 81, 51, 3.3, 0, 11),
    "Aceite de girasol":     (884, 0, 0, 0, 0, 100, 10, 0, 0, 0),
    "Aceite de oliva":       (884, 0, 0, 0, 0, 100, 14, 0, 0, 2),
    "Huevo":                 (143, 0.7, 0.4, 0, 12.6, 9.5, 3.1, 0, 0, 142),
    "Leche entera":          (61, 4.8, 4.8, 0, 3.2, 3.3, 1.9, 0.1, 0, 43),
    "Crema de leche":        (340, 2.8, 2.8, 0, 2.1, 36, 23, 1.1, 0, 27),
    "Queso cremoso":         (300, 1.0, 0.5, 0, 20, 24, 15, 0.8, 0, 600),
    "Pollo entero":          (215, 0, 0, 0, 18.6, 15, 4.3, 0.1, 0, 70),
    "Carne picada":          (254, 0, 0, 0, 17.2, 20, 7.7, 1.1, 0, 66),
    "Malta pilsen":          (361, 78, 1, 0, 10.3, 1.8, 0.4, 0, 7.1, 11),
    "Lúpulo cascade":        (245, 52, 0, 0, 20, 4, 1, 0, 40, 10),
    "Agua":                  (0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    "Bicarbonato de sodio":  (0, 0, 0, 0, 0, 0, 0, 0, 0, 27360),
    "Esencia de vainilla":   (288, 12.7, 12.7, 0, 0.1, 0.1, 0, 0, 0, 9),
    "Chocolate cobertura":   (546, 61, 48, 48, 4.9, 31, 19, 0, 7, 24),
    "Miel":                  (304, 82, 82, 82, 0.3, 0, 0, 0, 0.2, 4),
    "Polvo de hornear":      (53, 27.7, 0, 0, 0, 0, 0, 0, 0.2, 10600),
    "Almidón de maíz":       (381, 91, 0, 0, 0.3, 0.1, 0, 0, 0.9, 9),
    "Avena":                 (389, 66, 1, 0, 16.9, 6.9, 1.2, 0, 10.6, 2),
    "Canela molida":         (247, 81, 2.2, 0, 4, 1.2, 0.3, 0, 53, 10),
    "Nuez moscada":          (525, 49, 3, 0, 5.8, 36, 26, 0, 21, 16),
    "Almendras":             (579, 22, 4.4, 0, 21, 50, 3.8, 0, 12.5, 1),
    "Nueces":                (654, 14, 2.6, 0, 15, 65, 6.1, 0, 6.7, 2),
    "Pasas de uva":          (299, 79, 59, 0, 3.1, 0.5, 0.1, 0, 3.7, 11),
    "Dulce de leche":        (315, 55, 50, 40, 6.8, 7.5, 4.6, 0.2, 0, 129),
    "Mermelada de frutilla": (250, 62, 48.5, 48, 0.4, 0.1, 0, 0, 1.1, 32),
    "Vinagre de alcohol":    (18, 0.04, 0.04, 0, 0, 0, 0, 0, 0, 2),
    "Jugo de limón":         (22, 6.9, 2.5, 0, 0.4, 0.2, 0, 0, 0.3, 1),
    "Colorante vegetal":     (0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    # Insumos que agrega seed_recetas
    "Fermento láctico":      (350, 80, 0, 0, 10, 2, 1.2, 0, 0, 800),
    "Cuajo":                 (10, 0, 0, 0, 2.5, 0, 0, 0, 0, 2000),
    "Zanahoria":             (41, 9.6, 4.7, 0, 0.9, 0.2, 0, 0, 2.8, 69),
    "Cebolla":               (40, 9.3, 4.2, 0, 1.1, 0.1, 0, 0, 1.7, 4),
    "Ácido cítrico":         (0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    "Sorbato de potasio":    (0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
}


def _valores(nombre: str) -> dict[str, Decimal]:
    valores = dict(zip(DATOS_NUTRICIONALES, (Decimal(str(v)) for v in INFORMACION_NUTRICIONAL[nombre])))

    # Mismas reglas que informacion_nutricional_insumo.services._validar_reglas_nutricionales
    if valores["azucares_anadidos"] > valores["azucares_totales"]:
        raise ValueError(f"{nombre}: los azúcares añadidos superan a los azúcares totales.")
    if valores["azucares_totales"] > valores["carbohidratos"]:
        raise ValueError(f"{nombre}: los azúcares totales superan a los carbohidratos.")
    if valores["grasas_saturadas"] + valores["grasas_trans"] > valores["grasas_totales"]:
        raise ValueError(f"{nombre}: saturadas + trans superan a las grasas totales.")
    return valores


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
            licencia_verificada=True,
            activo=True,
            verificada_por_id=administrador.id,
            fecha_verificacion=datetime.now(),
        )
        db.add(fuente)
        db.flush()
    return fuente


def generar_informacion_nutricional(db) -> list[InformacionNutricionalInsumo]:
    administrador = _administrador(db)
    fuente = _obtener_o_crear_fuente(db, administrador)

    con_informacion = set(db.scalars(
        select(InformacionNutricionalInsumo.insumo_id).where(InformacionNutricionalInsumo.insumo_id.is_not(None))
    ).all())
    insumos = db.scalars(
        select(Insumo).where(Insumo.tipo_herencia == "general", Insumo.nombre.in_(INFORMACION_NUTRICIONAL))
    ).all()

    ahora = datetime.now()
    return [
        InformacionNutricionalInsumo(
            insumo_id=insumo.id,
            **_valores(insumo.nombre),
            fuente_nutricional_id=fuente.id,
            referencia_fuente=f"{insumo.nombre} ({insumo.marca}) - valores cada 100 g",
            cargada_por_id=administrador.id,
            fecha_carga=ahora,
            modificado=False,
        )
        for insumo in insumos
        if insumo.id not in con_informacion
    ]


def main():
    db = SessionLocal()
    try:
        informacion = generar_informacion_nutricional(db)
        db.add_all(informacion)
        db.commit()
        print(f"Se insertó la información nutricional de {len(informacion)} insumos.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
