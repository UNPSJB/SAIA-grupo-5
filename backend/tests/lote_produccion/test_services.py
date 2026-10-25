import pytest
from src.lote_produccion import services, schemas, exceptions
from src.producto import services as producto_services
from datetime import date


def test_crear_lote_produccion(db_session, unico_producto):
    datos = schemas.LoteProduccionCreate(
        producto_id=unico_producto.id,
        fecha_produccion=date(2027, 10, 1),
        fecha_vencimiento=date(2028, 10, 1),
        cantidad_producida=100,
    )
    
    nuevo = services.crear_lote_produccion(db=db_session, lote=datos)

    assert nuevo.id is not None
    assert nuevo.producto_id == unico_producto.id
    assert nuevo.cantidad_producida == 100
    assert nuevo.activo is True


def test_crear_lote_con_producto_inactivo(db_session, unico_producto):
    producto_services.cambiar_estado_producto(db=db_session, producto_id=unico_producto.id)

    datos = schemas.LoteProduccionCreate(
        producto_id=unico_producto.id,
        fecha_produccion=date(2027, 10, 1),
        fecha_vencimiento=date(2028, 10, 1),
        cantidad_producida=50,
    )

    with pytest.raises(exceptions.ProductoDadoDeBaja):
        services.crear_lote_produccion(db=db_session, lote=datos)


def test_listar_lotes_produccion(db_session, multiples_lotes_produccion, unico_producto):
    lotes = services.listar_lotes_produccion(db=db_session)

    assert len(lotes) == 3
    assert lotes[0].producto_id == unico_producto.id


def test_leer_lote_produccion(db_session, unico_lote_produccion, unico_producto):
    lote = services.leer_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id)

    assert lote.id == unico_lote_produccion.id
    assert lote.producto_id == unico_producto.id


def test_leer_lote_produccion_no_encontrado(db_session):
    with pytest.raises(exceptions.LoteProduccionNoEncontrado):
        services.leer_lote_produccion(db=db_session, lote_id=999)


def test_modificar_lote_produccion(db_session, unico_lote_produccion, unico_producto):
    datos = schemas.LoteProduccionUpdate(
        producto_id=unico_producto.id,
        fecha_produccion=date(2027, 11, 1),
        fecha_vencimiento=date(2028, 11, 1),
        cantidad_producida=250,
    )
    actualizado = services.modificar_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id, lote=datos)

    assert actualizado.cantidad_producida == 250


def test_cambiar_estado_lote_produccion(db_session, unico_lote_produccion):
    actualizado = services.cambiar_estado_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id)

    assert actualizado.activo is False


def test_modificar_lote_produccion_dado_de_baja(db_session, unico_lote_produccion, unico_producto):
    services.cambiar_estado_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id)

    datos = schemas.LoteProduccionUpdate(
        producto_id=unico_producto.id,
        fecha_produccion=date(2027, 11, 1),
        fecha_vencimiento=date(2028, 11, 1),
        cantidad_producida=300,
    )

    with pytest.raises(exceptions.LoteProduccionDadoDeBaja):
        services.modificar_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id, lote=datos)


def test_reactivar_lote_con_producto_inactivo(db_session, unico_lote_produccion, unico_producto):
    services.cambiar_estado_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id)

    producto_services.cambiar_estado_producto(db=db_session, producto_id=unico_producto.id)

    with pytest.raises(exceptions.ProductoDadoDeBaja):
        services.cambiar_estado_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id)