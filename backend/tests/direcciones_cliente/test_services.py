import pytest
from src.direcciones_cliente import services, schemas, exceptions
from src.clientes import services as cliente_services
from src.clientes.exceptions import ClienteNoEncontrado


def test_crear_direccion_cliente(db_session, unico_cliente):
    datos = schemas.DireccionClienteCreate(
        cliente_id=unico_cliente.id,
        calle_altura="San Martin 500",
        descripcion="Sucursal Este",
    )
    nueva = services.crear_direccion_cliente(db=db_session, datos=datos)

    assert nueva.id is not None
    assert nueva.cliente_id == unico_cliente.id
    assert nueva.calle_altura == "San Martin 500"
    assert nueva.activo is True


def test_crear_direccion_cliente_inexistente(db_session):
    datos = schemas.DireccionClienteCreate(
        cliente_id=999,
        calle_altura="San Martin 500",
        descripcion="Inexistente",
    )
    with pytest.raises(ClienteNoEncontrado):
        services.crear_direccion_cliente(db=db_session, datos=datos)


def test_crear_direccion_cliente_inactivo(db_session, unico_cliente):
    cliente_services.cambiar_estado_cliente(db=db_session, cliente_id=unico_cliente.id)

    datos = schemas.DireccionClienteCreate(
        cliente_id=unico_cliente.id,
        calle_altura="San Martin 500",
        descripcion="Fallo por inactivo",
    )
    with pytest.raises(exceptions.ClienteInactivo):
        services.crear_direccion_cliente(db=db_session, datos=datos)


def test_listar_direcciones_por_cliente(db_session, unico_cliente, multiples_direcciones_cliente):
    direcciones = services.listar_direcciones_por_cliente(db=db_session, cliente_id=unico_cliente.id)
    assert len(direcciones) == 3


def test_listar_direcciones_cliente_no_encontrado(db_session):
    with pytest.raises(ClienteNoEncontrado):
        services.listar_direcciones_por_cliente(db=db_session, cliente_id=999)


def test_leer_direccion_cliente(db_session, unica_direccion_cliente):
    direccion = services.leer_direccion_cliente(db=db_session, direccion_id=unica_direccion_cliente.id)
    assert direccion.id == unica_direccion_cliente.id
    assert direccion.calle_altura == unica_direccion_cliente.calle_altura


def test_leer_direccion_cliente_no_encontrada(db_session):
    with pytest.raises(exceptions.DireccionClienteNoEncontrada):
        services.leer_direccion_cliente(db=db_session, direccion_id=999)


def test_modificar_direccion_cliente(db_session, unica_direccion_cliente):
    datos = schemas.DireccionClienteUpdate(
        calle_altura="Av. Fontana 999",
        descripcion="Deposito Ampliado",
    )
    actualizada = services.modificar_direccion_cliente(
        db=db_session, direccion_id=unica_direccion_cliente.id, datos=datos
    )
    assert actualizada.calle_altura == "Av. Fontana 999"
    assert actualizada.descripcion == "Deposito Ampliado"


def test_modificar_direccion_cliente_dado_de_baja(db_session, unica_direccion_cliente):
    services.cambiar_estado_direccion_cliente(db=db_session, direccion_id=unica_direccion_cliente.id)

    datos = schemas.DireccionClienteUpdate(
        calle_altura="Av. Fontana 999",
        descripcion="Intento Modificar",
    )
    with pytest.raises(exceptions.DireccionClienteDadoDeBaja):
        services.modificar_direccion_cliente(
            db=db_session, direccion_id=unica_direccion_cliente.id, datos=datos
        )


def test_cambiar_estado_direccion_cliente(db_session, unica_direccion_cliente):
    actualizada = services.cambiar_estado_direccion_cliente(
        db=db_session, direccion_id=unica_direccion_cliente.id
    )
    assert actualizada.activo is False