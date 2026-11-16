import pytest

from src.aditivo.models import Aditivo


@pytest.fixture
def unico_aditivo(db_session):
    aditivo = Aditivo(clase_funcional="Conservante", nombre="Sorbato de potasio", numero_ins="202", activo=True)
    db_session.add(aditivo)
    db_session.commit()
    db_session.refresh(aditivo)
    return aditivo


@pytest.fixture
def multiples_aditivos(db_session):
    aditivos = [
        Aditivo(clase_funcional="Conservante", nombre="Sorbato de potasio", numero_ins="202", activo=True),
        Aditivo(clase_funcional="Antioxidante", nombre="Ácido ascórbico", numero_ins="300", activo=True),
        Aditivo(clase_funcional="Aromatizante", nombre="Aroma de vainilla", numero_ins=None, activo=False),
    ]
    db_session.add_all(aditivos)
    db_session.commit()
    for aditivo in aditivos:
        db_session.refresh(aditivo)
    return aditivos
