from datetime import date, timedelta
import pytest
from src.lote_proveedor import exceptions, schemas, services
from src.pedidos_proveedor.constants import EstadoPedidoProveedor


def test_listar_lotes_proveedor(db_session, multiples_lotes_proveedor):
    lotes = services.listar_lotes_proveedor(db_session)
    assert len(lotes) >= 3


def test_leer_lote_proveedor_exitoso(db_session, unico_lote_proveedor):
    lote = services.leer_lote_proveedor(db_session, unico_lote_proveedor.id)
    assert lote.id == unico_lote_proveedor.id
    assert lote.numero_remito == unico_lote_proveedor.numero_remito
    assert lote.proveedor is not None


def test_leer_lote_proveedor_no_encontrado_error(db_session):
    with pytest.raises(exceptions.LoteProveedorNoEncontrado):
        services.leer_lote_proveedor(db_session, 99999)


def test_crear_lote_proveedor_exitoso_y_cambia_pedido_a_recibido(db_session, unico_proveedor, unico_pedido_proveedor):
    datos = schemas.LoteProveedorCreate(
        proveedor_id=unico_proveedor.id,
        pedido_id=unico_pedido_proveedor.id,
        numero_remito="R-0002-00000001",
        fecha_recepcion=date.today(),
    )

    nuevo = services.crear_lote_proveedor(db_session, datos, usuario_id=1)

    assert nuevo.id is not None
    assert nuevo.numero_remito == "R-0002-00000001"
    assert nuevo.pedido_id == unico_pedido_proveedor.id
    assert nuevo.activo is True

    db_session.refresh(unico_pedido_proveedor)
    assert unico_pedido_proveedor.estado == EstadoPedidoProveedor.RECIBIDO


def test_crear_lote_proveedor_inexistente_error(db_session, unico_pedido_proveedor):
    datos = schemas.LoteProveedorCreate(
        proveedor_id=99999,
        pedido_id=unico_pedido_proveedor.id,
        numero_remito="R-FAIL-01",
        fecha_recepcion=date.today(),
    )

    with pytest.raises(exceptions.ProveedorNoExisteOInactivo):
        services.crear_lote_proveedor(db_session, datos, usuario_id=1)


def test_crear_lote_proveedor_inactivo_error(db_session, multiples_proveedores, unico_pedido_proveedor):
    proveedor_inactivo = multiples_proveedores[2]
    datos = schemas.LoteProveedorCreate(
        proveedor_id=proveedor_inactivo.id,
        pedido_id=unico_pedido_proveedor.id,
        numero_remito="R-FAIL-02",
        fecha_recepcion=date.today(),
    )

    with pytest.raises(exceptions.ProveedorNoExisteOInactivo):
        services.crear_lote_proveedor(db_session, datos, usuario_id=1)


def test_crear_lote_proveedor_habilitacion_vencida_bloqueo(db_session, multiples_proveedores, unico_pedido_proveedor):
    proveedor_vencido = multiples_proveedores[1]
    datos = schemas.LoteProveedorCreate(
        proveedor_id=proveedor_vencido.id,
        pedido_id=unico_pedido_proveedor.id,
        numero_remito="R-BLOQ-01",
        fecha_recepcion=date.today(),
    )

    with pytest.raises(exceptions.HabilitacionProveedorVencida):
        services.crear_lote_proveedor(db_session, datos, usuario_id=1)


def test_crear_lote_proveedor_pedido_no_valido_error(db_session, unico_proveedor):
    datos = schemas.LoteProveedorCreate(
        proveedor_id=unico_proveedor.id,
        pedido_id=99999,
        numero_remito="R-PED-FAIL",
        fecha_recepcion=date.today(),
    )

    with pytest.raises(exceptions.PedidoNoValido):
        services.crear_lote_proveedor(db_session, datos, usuario_id=1)


def test_modificar_lote_proveedor_exitoso(db_session, unico_lote_proveedor):
    datos = schemas.LoteProveedorUpdate(
        numero_remito="R-MOD-0001",
        fecha_recepcion=date.today() - timedelta(days=1),
    )

    modificado = services.modificar_lote_proveedor(db_session, unico_lote_proveedor.id, datos)
    assert modificado.numero_remito == "R-MOD-0001"


def test_cambiar_estado_lote_proveedor(db_session, unico_lote_proveedor):
    estado_original = unico_lote_proveedor.activo
    lote = services.cambiar_estado_lote_proveedor(db_session, unico_lote_proveedor.id)
    assert lote.activo == (not estado_original)