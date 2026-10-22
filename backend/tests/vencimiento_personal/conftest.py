import pytest

from src.tipos_vencimientos.models import TipoVencimiento

@pytest.fixture
def tipo_vencimiento(db_session):
    _tipo = TipoVencimiento(
        nombre="Carnet de manipulador",
        descripcion="Carnet habilitante para manipular alimentos.",
        activo=True,
    )
    db_session.add(_tipo)
    db_session.commit()
    db_session.refresh(_tipo)
    return _tipo
