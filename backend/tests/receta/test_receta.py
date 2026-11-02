from src.exceptions import PermissionDenied
from src.producto.constants import ErrorCode as ProductoErrorCode
from src.receta.constants import ErrorCode


ETAPAS = [
    {
        "nombre": "Preparación",
        "pasos": [
            {"descripcion": "Cortar el salame en rodajas."},
            {"descripcion": "Abrir el pan al medio."},
        ],
    },
    {
        "nombre": "Armado",
        "pasos": [{"descripcion": "Rellenar el pan con el salame."}],
    },
]


def test_crear_receta(client, auth_headers, unico_producto):
    response = client.post(
        "/recetas/",
        json={"producto_id": unico_producto.id, "etapas": ETAPAS},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["producto_id"] == unico_producto.id
    assert len(data["etapas"]) == 2
    assert data["etapas"][0]["nombre"] == "Preparación"
    assert data["etapas"][0]["orden"] == 1
    assert data["etapas"][1]["orden"] == 2
    assert [p["orden"] for p in data["etapas"][0]["pasos"]] == [1, 2]


# error 400 - el producto ya tiene una receta
def test_crear_receta_duplicada(client, auth_headers, receta):
    response = client.post(
        "/recetas/",
        json={"producto_id": receta.producto_id, "etapas": ETAPAS},
        headers=auth_headers,
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == ErrorCode.RECETA_DUPLICADA


# error 404 - el producto no existe
def test_crear_receta_producto_no_existe(client, auth_headers):
    response = client.post(
        "/recetas/",
        json={"producto_id": 9999, "etapas": ETAPAS},
        headers=auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == ProductoErrorCode.PRODUCTO_NO_ENCONTRADO


# error 422 - la receta debe tener al menos una etapa
def test_crear_receta_sin_etapas(client, auth_headers, unico_producto):
    response = client.post(
        "/recetas/",
        json={"producto_id": unico_producto.id, "etapas": []},
        headers=auth_headers,
    )

    assert response.status_code == 422


# error 403
def test_crear_receta_sin_permiso(client, auth_headers_sin_permiso, unico_producto):
    response = client.post(
        "/recetas/",
        json={"producto_id": unico_producto.id, "etapas": ETAPAS},
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == PermissionDenied.DETAIL


def test_leer_receta(client, auth_headers, receta):
    response = client.get(f"/recetas/{receta.id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == receta.id
    assert len(data["etapas"]) == 1
    assert len(data["etapas"][0]["pasos"]) == 2


# error 404
def test_receta_no_existe(client, auth_headers):
    response = client.get("/recetas/9999", headers=auth_headers)

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == ErrorCode.RECETA_NO_ENCONTRADA


def test_leer_receta_de_producto(client, auth_headers, receta):
    response = client.get(f"/recetas/producto/{receta.producto_id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == receta.id


# error 404 - el producto no tiene receta
def test_leer_receta_de_producto_sin_receta(client, auth_headers, unico_producto):
    response = client.get(f"/recetas/producto/{unico_producto.id}", headers=auth_headers)

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == ErrorCode.RECETA_NO_ENCONTRADA


# error 404 - el producto no existe
def test_leer_receta_de_producto_no_existe(client, auth_headers):
    response = client.get("/recetas/producto/9999", headers=auth_headers)

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == ProductoErrorCode.PRODUCTO_NO_ENCONTRADO


def test_modificar_receta(client, auth_headers, receta):
    response = client.put(
        f"/recetas/{receta.id}",
        json={"etapas": ETAPAS},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    # las etapas anteriores se reemplazan por las nuevas
    assert [e["nombre"] for e in data["etapas"]] == ["Preparación", "Armado"]
    assert len(data["etapas"][1]["pasos"]) == 1


# error 404
def test_modificar_receta_no_existe(client, auth_headers):
    response = client.put(
        "/recetas/9999",
        json={"etapas": ETAPAS},
        headers=auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == ErrorCode.RECETA_NO_ENCONTRADA


# error 403
def test_modificar_receta_sin_permiso(client, auth_headers_sin_permiso, receta):
    response = client.put(
        f"/recetas/{receta.id}",
        json={"etapas": ETAPAS},
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == PermissionDenied.DETAIL
