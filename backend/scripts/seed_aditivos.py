from sqlalchemy import select

import src.all_models
from src.database import SessionLocal, engine
from src.models import ModeloBase
from src.aditivo.models import Aditivo


ADITIVOS = [
    ("Acidulante", "Ácido cítrico", "330"),
    ("Acidulante", "Ácido láctico", "270"),
    ("Antiaglutinante", "Dióxido de silicio", "551"),
    ("Antioxidante", "Ácido ascórbico", "300"),
    ("Antioxidante", "Tocoferoles", "307"),
    ("Aromatizante", "Aroma natural de vainilla", None),
    ("Aromatizante", "Aroma idéntico al natural de limón", None),
    ("Colorante", "Tartrazina", "102"),
    ("Colorante", "Caramelo IV", "150d"),
    ("Colorante", "Carmín", "120"),
    ("Conservante", "Sorbato de potasio", "202"),
    ("Conservante", "Benzoato de sodio", "211"),
    ("Conservante", "Propionato de calcio", "282"),
    ("Edulcorante", "Sucralosa", "955"),
    ("Edulcorante", "Glucósidos de esteviol", "960"),
    ("Emulsionante", "Lecitina de soja", "322"),
    ("Espesante", "Goma xántica", "415"),
    ("Gelificante", "Pectina", "440"),
    ("Humectante", "Glicerol", "422"),
    ("Leudante químico", "Pirofosfato ácido de sodio", "450i"),
    ("Regulador de acidez", "Bicarbonato de sodio", "500ii"),
    ("Resaltador de sabor", "Glutamato monosódico", "621"),
]


def generar_aditivos(db) -> list[Aditivo]:
    existentes = {aditivo.nombre for aditivo in db.scalars(select(Aditivo)).all()}
    return [
        Aditivo(clase_funcional=clase, nombre=nombre, numero_ins=numero_ins, activo=True)
        for clase, nombre, numero_ins in ADITIVOS
        if nombre not in existentes
    ]


def main():
    ModeloBase.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        aditivos = generar_aditivos(db)

        db.add_all(aditivos)
        db.commit()

        print(f"Se insertaron {len(aditivos)} aditivos.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
