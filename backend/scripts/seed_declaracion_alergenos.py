"""
Genera las declaraciones de alérgenos y gluten para las recetas vigentes,
incluyendo ejemplos de contaminación cruzada, condiciones de conservación
y declaraciones confirmadas.

Uso: python -m scripts.seed_declaracion_alergenos
"""

from sqlalchemy import select

import src.all_models  # noqa: F401
from src.alergenos.models import Alergeno
from src.database import SessionLocal, engine
from src.declaracion_alergenos import schemas, services
from src.declaracion_alergenos.models import DeclaracionAlergenosReceta
from src.models import ModeloBase
from src.personal.models import Persona
from src.receta.models import Receta

DATOS_COMPLEMENTARIOS: dict[str, dict] = {
    "Pan de campo": {
        "cruzada": [("Soja", False), ("Leche", True)],
        "conservacion": "Conservar en lugar fresco y seco, dentro de envase cerrado.",
        "confirmar": True,
    },
    "Yogur natural": {
        "cruzada": [],
        "conservacion": "Mantener refrigerado entre 2 °C y 8 °C. Una vez abierto consumir dentro de las 48 horas.",
        "confirmar": True,
    },
    "Galletitas de avena": {
        "cruzada": [("Maní", False), ("Nueces", False)],
        "conservacion": "Conservar en lugar fresco y seco al abrigo de la luz.",
        "confirmar": False,
    },
    "Caldo de verduras": {
        "cruzada": [],
        "conservacion": "Conservar en lugar fresco y seco. Una vez preparado mantener refrigerado.",
        "confirmar": True,
    },
}


def main():
    ModeloBase.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        recetas_vigentes = db.scalars(
            select(Receta).where(Receta.vigente.is_(True))
        ).all()

        ya_declaradas = {
            d.receta_id
            for d in db.scalars(select(DeclaracionAlergenosReceta)).all()
        }
        catalogo = {a.nombre: a for a in db.scalars(select(Alergeno)).all()}
        admin = db.scalars(
            select(Persona).where(Persona.administrar.is_(True))
        ).first()

        generadas = 0
        for receta in recetas_vigentes:
            if receta.id in ya_declaradas:
                continue

            services.crear_propuesta_receta(db, receta.id)
            generadas += 1

            nombre_prod = receta.producto.nombre if receta.producto else ""
            extra = DATOS_COMPLEMENTARIOS.get(nombre_prod)
            if extra:
                items_cruzada = [
                    schemas.ContaminacionCruzadaItem(
                        alergeno_id=catalogo[nombre].id,
                        es_derivado=es_der,
                    )
                    for nombre, es_der in extra["cruzada"]
                    if nombre in catalogo
                ]
                services.modificar_declaracion_receta(
                    db,
                    receta.id,
                    schemas.DeclaracionAlergenosUpdate(
                        contaminacion_cruzada=items_cruzada,
                        condiciones_conservacion=extra["conservacion"],
                    ),
                )
                if extra["confirmar"] and admin is not None:
                    services.confirmar_declaracion_receta(db, receta.id, admin)

        print(f"Se generaron {generadas} declaraciones de alérgenos en recetas.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()