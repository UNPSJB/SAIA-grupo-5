import pytest

from src.insumos.models import Insumo


@pytest.fixture
def insumo(db_session):
    _insumo = Insumo(
        nombre="Detergente",
        unidad_medida="Litro",
        activo=True,
    )
    db_session.add(_insumo)
    db_session.commit()
    db_session.refresh(_insumo)
    return _insumo
