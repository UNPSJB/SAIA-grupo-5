import asyncio

import pytest

from src.auth.dependencies import tiene_permiso_supervisor
from src.exceptions import PermissionDenied
from src.personal.constants import ErrorCode


def test_login_supervisor(client, supervisor):
    response = client.post("/auth/token", data={"username": "sup_ctrl", "password": "super123"})

    assert response.status_code == 200
    assert response.json()["access_token"]


def test_leer_propia_persona_supervisor(client, auth_headers_supervisor, supervisor):
    response = client.get(f"/personal/{supervisor.id}", headers=auth_headers_supervisor)

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "sup_ctrl"
    assert data["supervisor"] is True
    assert data["administrar"] is False
    assert data["role_name"] == "supervisor"
    assert data["role_id"] == 3
    assert "supervisor" in data["capacidades"]


def test_dependencia_supervisor_con_el_rol(supervisor):
    persona = asyncio.run(tiene_permiso_supervisor(persona=supervisor))

    assert persona is supervisor


# error 403
def test_dependencia_supervisor_sin_el_rol(persona):
    # persona: operar=True pero supervisor=False
    with pytest.raises(PermissionDenied):
        asyncio.run(tiene_permiso_supervisor(persona=persona))


# los endpoints de consulta solo exigen estar logueado
def test_supervisor_consulta_catalogo(client, auth_headers_supervisor):
    response = client.get("/unidades-medida/", headers=auth_headers_supervisor)

    assert response.status_code == 200


# error 403 - el listado de personal exige administrar
def test_supervisor_no_puede_listar_personal(client, auth_headers_supervisor):
    response = client.get("/personal/", headers=auth_headers_supervisor)

    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == PermissionDenied.DETAIL


# error 403 - solo se puede leer la propia ficha
def test_supervisor_no_puede_leer_persona_ajena(client, auth_headers_supervisor, persona):
    response = client.get(f"/personal/{persona.id}", headers=auth_headers_supervisor)

    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == PermissionDenied.DETAIL


# error 403 - por defecto las escrituras exigen administrar
def test_supervisor_no_puede_crear_persona(client, auth_headers_supervisor):
    response = client.post(
        "/personal/",
        json={
            "nombre": "Juan",
            "apellido": "Nuevo",
            "dni": "30999888",
            "mail": "juan.nuevo@test.com",
            "username": "juan_nuevo",
            "password": "clave123",
            "operar": True,
        },
        headers=auth_headers_supervisor,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == PermissionDenied.DETAIL


# el supervisor es una capacidad por sí sola, sin operar ni administrar
def test_crear_persona_solo_supervisor(client, auth_headers):
    response = client.post(
        "/personal/",
        json={
            "nombre": "Maria",
            "apellido": "Walhall",
            "dni": "30777666",
            "mail": "maria@test.com",
            "username": "maria_sup",
            "password": "clave123",
            "supervisor": True,
            "operar": False,
            "administrar": False,
        },
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["supervisor"] is True
    assert data["operar"] is False
    assert data["administrar"] is False
    assert data["role_name"] == "supervisor"


def test_asignar_supervisor_a_persona_existente(client, auth_headers, persona):
    response = client.put(f"/personal/{persona.id}", json={"supervisor": True}, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["supervisor"] is True
    assert data["operar"] is True
    assert data["role_name"] == "supervisor"


# error 400 - no puede quedar sin ninguna capacidad
def test_quitar_supervisor_a_persona_solo_supervisor(client, auth_headers, supervisor):
    response = client.put(f"/personal/{supervisor.id}", json={"supervisor": False}, headers=auth_headers)

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == ErrorCode.DEBE_TENER_CAPACIDAD
