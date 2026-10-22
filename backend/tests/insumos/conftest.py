import pytest

from src.insumos.models import Insumo
from src.personal.models import Persona
from src.auth.utils import get_password_hash


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


@pytest.fixture
def auth_headers_sin_permiso(client, db_session):
    # Persona logueada pero sin permiso de administrar
    _persona = Persona(
        nombre="Operador",
        apellido="Test",
        dni="00000002",
        mail="operador.test@test.com",
        username="operador_test",
        hashed_password=get_password_hash("operador123"),
        operar=True,
        administrar=False,
        activo=True,
    )
    db_session.add(_persona)
    db_session.commit()

    r = client.post("/auth/token", data={"username": "operador_test", "password": "operador123"})
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
