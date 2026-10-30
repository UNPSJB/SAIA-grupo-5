import pytest
from datetime import date

from src.personal.models import Persona
from src.auth.utils import get_password_hash


def _persona(username: str, **capacidades):
    return Persona(
        nombre="Juan",
        apellido="Supervisor",
        dni=f"30{username}",
        mail=f"{username}@test.com",
        username=username,
        hashed_password=get_password_hash("super123"),
        activo=True,
        **capacidades,
    )


@pytest.fixture
def supervisor(db_session):
    # Persona solo con el rol de supervisor: ni operar ni administrar
    _supervisor = _persona("sup_ctrl", operar=False, administrar=False, supervisor=True)
    db_session.add(_supervisor)
    db_session.commit()
    db_session.refresh(_supervisor)
    return _supervisor


@pytest.fixture
def auth_headers_supervisor(client, supervisor):
    r = client.post("/auth/token", data={"username": "sup_ctrl", "password": "super123"})
    assert r.status_code == 200
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
