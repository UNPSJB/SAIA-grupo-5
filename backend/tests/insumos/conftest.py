import pytest

from src.insumos.models import Insumo
from src.unidad_medida.models import UnidadMedida


@pytest.fixture
def unidad_medida(db_session):
    _unidad = UnidadMedida(nombre="Litro", activo=True)
    db_session.add(_unidad)
    db_session.commit()
    db_session.refresh(_unidad)
    return _unidad


@pytest.fixture
def insumo(db_session, unidad_medida):
    _insumo = Insumo(
        nombre="Detergente",
        unidad_medida_id=unidad_medida.id,
        activo=True,
    )
    db_session.add(_insumo)
    db_session.commit()
    db_session.refresh(_insumo)
    return _insumo
