from src.auth.utils import get_password_hash
from src.personal.constants import ErrorCode
from src.personal.models import Persona

URL = "/personal/me"


def _crear_otra_persona(db_session, username: str = "otra_persona", mail: str = "otra@test.com"):
    _otra = Persona(
        nombre="Otra",
        apellido="Persona",
        dni="30111222",
        mail=mail,
        username=username,
        hashed_password=get_password_hash("otra1234"),
        activo=True,
        operar=True,
        administrar=False,
        supervisor=False,
    )
    db_session.add(_otra)
    db_session.commit()
    db_session.refresh(_otra)
    return _otra


# cualquier persona logueada (no hace falta ser administrador) puede editar su cuenta
def test_modificar_nombre_y_apellido(client, auth_headers_supervisor, supervisor):
    response = client.put(
        URL,
        json={"nombre": "Laura", "apellido": "Gomez"},
        headers=auth_headers_supervisor,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == supervisor.id
    assert data["nombre"] == "Laura"
    assert data["apellido"] == "Gomez"

    # el cambio quedó guardado
    guardada = client.get(f"/personal/{supervisor.id}", headers=auth_headers_supervisor).json()
    assert guardada["nombre"] == "Laura"
    assert guardada["apellido"] == "Gomez"


def test_modificar_mail(client, auth_headers_supervisor):
    response = client.put(URL, json={"mail": "nuevo.mail@test.com"}, headers=auth_headers_supervisor)

    assert response.status_code == 200
    assert response.json()["mail"] == "nuevo.mail@test.com"


# enviar el mismo mail que ya tiene no es un conflicto
def test_modificar_con_su_propio_mail(client, auth_headers_supervisor, supervisor):
    response = client.put(URL, json={"mail": supervisor.mail}, headers=auth_headers_supervisor)

    assert response.status_code == 200
    assert response.json()["mail"] == supervisor.mail


# una actualización parcial no pisa los campos que no se enviaron
def test_modificar_parcial_conserva_otros_campos(client, auth_headers_supervisor, supervisor):
    response = client.put(URL, json={"nombre": "Laura"}, headers=auth_headers_supervisor)

    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == "Laura"
    assert data["apellido"] == supervisor.apellido
    assert data["mail"] == supervisor.mail


# el username, el DNI y las capacidades no se pueden modificar desde la cuenta
def test_no_modifica_username_ni_capacidades(client, auth_headers_supervisor, supervisor):
    response = client.put(
        URL,
        json={
            "nombre": "Laura",
            "username": "otro_username",
            "dni": "99999999",
            "administrar": True,
            "operar": True,
        },
        headers=auth_headers_supervisor,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == "Laura"
    assert data["username"] == "sup_ctrl"
    assert data["dni"] == supervisor.dni
    assert data["administrar"] is False
    assert data["operar"] is False
    assert data["role_name"] == "supervisor"


def test_cambiar_password(client, auth_headers_supervisor):
    response = client.put(
        URL,
        json={"password_actual": "super123", "password": "nueva1234"},
        headers=auth_headers_supervisor,
    )

    assert response.status_code == 200

    # puede iniciar sesión con la nueva contraseña
    login = client.post("/auth/token", data={"username": "sup_ctrl", "password": "nueva1234"})
    assert login.status_code == 200
    assert login.json()["access_token"]

    # y la anterior ya no funciona
    login_vieja = client.post("/auth/token", data={"username": "sup_ctrl", "password": "super123"})
    assert login_vieja.status_code != 200


# error 400 - la contraseña actual no coincide
def test_cambiar_password_actual_incorrecta(client, auth_headers_supervisor):
    response = client.put(
        URL,
        json={"password_actual": "equivocada", "password": "nueva1234"},
        headers=auth_headers_supervisor,
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == ErrorCode.PASSWORD_ACTUAL_INCORRECTA

    # la contraseña original sigue funcionando
    login = client.post("/auth/token", data={"username": "sup_ctrl", "password": "super123"})
    assert login.status_code == 200


# error 422 - para cambiar la contraseña hay que indicar la actual
def test_cambiar_password_sin_password_actual(client, auth_headers_supervisor):
    response = client.put(URL, json={"password": "nueva1234"}, headers=auth_headers_supervisor)

    assert response.status_code == 422


# error 422 - la nueva contraseña tiene un mínimo de 4 caracteres
def test_cambiar_password_muy_corta(client, auth_headers_supervisor):
    response = client.put(
        URL,
        json={"password_actual": "super123", "password": "abc"},
        headers=auth_headers_supervisor,
    )

    assert response.status_code == 422


# error 400 - el mail ya lo usa otra persona
def test_modificar_mail_existente(client, auth_headers_supervisor, db_session):
    otra = _crear_otra_persona(db_session)

    response = client.put(URL, json={"mail": otra.mail}, headers=auth_headers_supervisor)

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == ErrorCode.MAIL_EXISTENTE


# error 422 - formato de mail inválido
def test_modificar_mail_invalido(client, auth_headers_supervisor):
    response = client.put(URL, json={"mail": "no-es-un-mail"}, headers=auth_headers_supervisor)

    assert response.status_code == 422


# error 422 - el nombre no puede estar vacío
def test_modificar_nombre_vacio(client, auth_headers_supervisor):
    response = client.put(URL, json={"nombre": ""}, headers=auth_headers_supervisor)

    assert response.status_code == 422


# error 401
def test_modificar_cuenta_no_autenticado(client):
    response = client.put(URL, json={"nombre": "Laura"})

    assert response.status_code == 401


# solo se modifica la cuenta de quien está logueado, la de otra persona queda igual
def test_modificar_cuenta_no_afecta_a_otras_personas(client, auth_headers_supervisor, db_session):
    otra = _crear_otra_persona(db_session)
    otra_id = otra.id

    client.put(URL, json={"nombre": "Laura"}, headers=auth_headers_supervisor)

    # la otra persona inicia sesión y consulta su propia ficha
    login = client.post("/auth/token", data={"username": "otra_persona", "password": "otra1234"})
    assert login.status_code == 200
    headers_otra = {"Authorization": f"Bearer {login.json()['access_token']}"}

    response = client.get(f"/personal/{otra_id}", headers=headers_otra)

    assert response.status_code == 200
    assert response.json()["nombre"] == "Otra"