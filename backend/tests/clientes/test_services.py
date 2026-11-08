import pytest
from src.clientes import services, schemas, exceptions


def test_crear_cliente(db_session):
    datos = schemas.ClienteCreate(
        razon_social="Distribuidora Chubut",
        cuit="30-99881122-3",
        telefono="2804998877",
        email="ventas@chubut.com",
    )
    nuevo = services.crear_cliente(db=db_session, datos=datos)

    assert nuevo.id is not None
    assert nuevo.razon_social == "Distribuidora Chubut"
    assert nuevo.cuit == "30-99881122-3"
    assert nuevo.activo is True


def test_crear_cliente_cuit_duplicado(db_session, unico_cliente):
    datos = schemas.ClienteCreate(
        razon_social="Otra Empresa",
        cuit=unico_cliente.cuit,
        telefono="11223344",
        email="otro@empresa.com",
    )
    with pytest.raises(exceptions.ClienteYaExisteCuit):
        services.crear_cliente(db=db_session, datos=datos)


def test_listar_clientes(db_session, multiples_clientes):
    clientes = services.listar_clientes(db=db_session)
    assert len(clientes) == 3


def test_leer_cliente(db_session, unico_cliente):
    cliente = services.leer_cliente(db=db_session, cliente_id=unico_cliente.id)
    assert cliente.id == unico_cliente.id
    assert cliente.razon_social == unico_cliente.razon_social


def test_leer_cliente_no_encontrado(db_session):
    with pytest.raises(exceptions.ClienteNoEncontrado):
        services.leer_cliente(db=db_session, cliente_id=999)


def test_modificar_cliente(db_session, unico_cliente):
    datos = schemas.ClienteUpdate(
        razon_social="Distribuidora Sur SRL",
        cuit=unico_cliente.cuit,
        telefono="2804000000",
        email="nuevo@sur.com",
    )
    actualizado = services.modificar_cliente(db=db_session, cliente_id=unico_cliente.id, datos=datos)

    assert actualizado.razon_social == "Distribuidora Sur SRL"
    assert actualizado.telefono == "2804000000"


def test_modificar_cliente_cuit_duplicado(db_session, multiples_clientes):
    cliente1, cliente2, _ = multiples_clientes
    datos = schemas.ClienteUpdate(
        razon_social=cliente1.razon_social,
        cuit=cliente2.cuit,
        telefono=cliente1.telefono,
        email=cliente1.email,
    )
    with pytest.raises(exceptions.ClienteYaExisteCuit):
        services.modificar_cliente(db=db_session, cliente_id=cliente1.id, datos=datos)


def test_modificar_cliente_dado_de_baja(db_session, unico_cliente):
    services.cambiar_estado_cliente(db=db_session, cliente_id=unico_cliente.id)
    datos = schemas.ClienteUpdate(
        razon_social="Test Modificar Inactivo",
        cuit=unico_cliente.cuit,
        telefono="1234",
        email="test@test.com",
    )
    with pytest.raises(exceptions.ClienteDadoDeBaja):
        services.modificar_cliente(db=db_session, cliente_id=unico_cliente.id, datos=datos)


def test_cambiar_estado_cliente(db_session, unico_cliente):
    actualizado = services.cambiar_estado_cliente(db=db_session, cliente_id=unico_cliente.id)
    assert actualizado.activo is False

    reactivado = services.cambiar_estado_cliente(db=db_session, cliente_id=unico_cliente.id)
    assert reactivado.activo is True