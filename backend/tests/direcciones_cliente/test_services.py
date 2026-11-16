import pytest
from src.direcciones_cliente import services, schemas, exceptions
from src.clientes import services as cliente_services
from src.clientes.exceptions import ClienteNoEncontrado


def test_crear_direccion_cliente(db_session, unico_cliente):
    datos = schemas.DireccionClienteCreate(
        cliente_id=unico_cliente.id,
        calle_altura="San Martin 500",
        provincia="Chubut",
        localidad="Trelew",
        codigo_postal="9100",
        descripcion="Sucursal Este",
    )
    nueva = services.crear_direccion_cliente(db=db_session, datos=datos)

    assert nueva.id is not None
    assert nueva.cliente_id == unico_cliente.id
    assert nueva.calle_altura == "San Martin 500"
    assert nueva.provincia == "Chubut"
    assert nueva.localidad == "Trelew"
    assert nueva.codigo_postal == "9100"
    assert nueva.activo is True


def test_crear_direccion_cliente_inexistente(db_session):
    datos = schemas.DireccionClienteCreate(
        cliente_id=999,
        calle_altura="San Martin 500",
        provincia="Chubut",
        localidad="Trelew",
        codigo_postal="9100",
        descripcion="Inexistente",
    )
    with pytest.raises(ClienteNoEncontrado):
        services.crear_direccion_cliente(db=db_session, datos=datos)


def test_crear_direccion_cliente_inactivo(db_session, unico_cliente):
    cliente_services.cambiar_estado_cliente(db=db_session, cliente_id=unico_cliente.id)

    datos = schemas.DireccionClienteCreate(
        cliente_id=unico_cliente.id,
        calle_altura="San Martin 500",
        provincia="Chubut",
        localidad="Trelew",
        codigo_postal="9100",
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
    assert direccion.provincia == unica_direccion_cliente.provincia
    assert direccion.localidad == unica_direccion_cliente.localidad
    assert direccion.codigo_postal == unica_direccion_cliente.codigo_postal


def test_leer_direccion_cliente_no_encontrada(db_session):
    with pytest.raises(exceptions.DireccionClienteNoEncontrada):
        services.leer_direccion_cliente(db=db_session, direccion_id=999)


def test_modificar_direccion_cliente(db_session, unica_direccion_cliente):
    datos = schemas.DireccionClienteUpdate(
        calle_altura="Avenida Fontana 999",
        provincia="Chubut",
        localidad="Trelew",
        codigo_postal="9100",
        descripcion="Deposito Ampliado",
    )
    actualizada = services.modificar_direccion_cliente(
        db=db_session, direccion_id=unica_direccion_cliente.id, datos=datos
    )
    assert actualizada.calle_altura == "Avenida Fontana 999"
    assert actualizada.descripcion == "Deposito Ampliado"

def test_eliminar_direccion_cliente(db_session, unica_direccion_cliente):
    dir_id = unica_direccion_cliente.id

    resultado = services.eliminar_direccion_cliente(db=db_session, direccion_id=dir_id)

    assert resultado.id == dir_id
    assert resultado.calle_altura == "Avenida Fontana 123"

    with pytest.raises(exceptions.DireccionClienteNoEncontrada):
        services.leer_direccion_cliente(db=db_session, direccion_id=dir_id)