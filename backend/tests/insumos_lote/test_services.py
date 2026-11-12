import pytest
from datetime import date, timedelta
from src.insumos_lote import services, schemas, exceptions
from src.insumos_lote.models import InsumoLote


def test_listar_todos_los_insumos_lote(db_session, multiples_insumos_lote):
    resultado = services.listar_todos_los_insumos_lote(db_session)
    assert len(resultado) == 2
    for item in resultado:
        assert item.activo is True


def test_listar_insumos_de_lote_proveedor(db_session, unico_lote_proveedor, multiples_insumos_lote):
    resultado = services.listar_insumos_de_lote(db_session, unico_lote_proveedor.id)
    assert len(resultado) == 2
    assert all(i.lote_proveedor_id == unico_lote_proveedor.id for i in resultado)


def test_leer_insumo_lote_exitoso(db_session, unico_insumo_lote):
    item = services.leer_insumo_lote(db_session, unico_insumo_lote.id)
    assert item.id == unico_insumo_lote.id
    assert item.marca == "Molinos del Sur"
    assert item.cantidad == 50


def test_leer_insumo_lote_inexistente_error(db_session):
    with pytest.raises(exceptions.InsumoLoteNoEncontrado):
        services.leer_insumo_lote(db_session, 99999)


def test_agregar_insumo_a_lote_exitoso(db_session, unico_lote_proveedor, unico_insumo):
    datos = schemas.InsumoLoteCreate(
        insumo_id=unico_insumo.id,
        marca="Pureza",
        cantidad=40,
        fecha_vencimiento=date.today() + timedelta(days=45),
        costo_unitario=800.0,
        minimo_alerta=5,
    )
    nuevo = services.agregar_insumo_a_lote(db_session, unico_lote_proveedor.id, datos)
    assert nuevo.id is not None
    assert nuevo.marca == "Pureza"
    assert nuevo.cantidad == 40
    assert nuevo.cantidad_restante == 40
    assert nuevo.lote_proveedor_id == unico_lote_proveedor.id
    assert nuevo.activo is True


def test_agregar_insumo_a_lote_proveedor_inexistente_error(db_session, unico_insumo):
    datos = schemas.InsumoLoteCreate(
        insumo_id=unico_insumo.id,
        marca="Pureza",
        cantidad=10,
        fecha_vencimiento=date.today() + timedelta(days=30),
        minimo_alerta=5
    )
    with pytest.raises(exceptions.LoteProveedorNoEncontrado):
        services.agregar_insumo_a_lote(db_session, 99999, datos)


def test_agregar_insumo_invalido_o_inactivo_error(db_session, unico_lote_proveedor):
    datos = schemas.InsumoLoteCreate(
        insumo_id=99999,
        marca="Generica",
        cantidad=15,
        fecha_vencimiento=date.today() + timedelta(days=30),
        minimo_alerta=2
    )
    with pytest.raises(exceptions.InsumoNoEncontradoOInactivo):
        services.agregar_insumo_a_lote(db_session, unico_lote_proveedor.id, datos)


def test_eliminar_insumo_de_lote_exitoso(db_session, unico_insumo_lote):
    services.eliminar_insumo_de_lote(db_session, unico_insumo_lote.id)
    item = db_session.get(InsumoLote, unico_insumo_lote.id)
    assert item.activo is False


def test_eliminar_insumo_de_lote_inexistente_error(db_session):
    with pytest.raises(exceptions.InsumoLoteNoEncontrado):
        services.eliminar_insumo_de_lote(db_session, 99999)