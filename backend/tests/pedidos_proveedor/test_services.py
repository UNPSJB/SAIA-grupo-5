from datetime import date, timedelta
import pytest
from src.proveedor.models import ProveedorInsumo
from src.pedidos_proveedor import exceptions, schemas, services
from src.pedidos_proveedor.constants import EstadoPedidoProveedor


def test_listar_pedidos_proveedor(db_session, multiples_pedidos_proveedor):
    pedidos = services.listar_pedidos_proveedor(db_session)
    assert len(pedidos) >= 3


def test_leer_pedido_proveedor_exitoso(db_session, unico_pedido_proveedor):
    pedido = services.leer_pedido_proveedor(db_session, unico_pedido_proveedor.id)
    assert pedido.id == unico_pedido_proveedor.id
    assert pedido.estado == EstadoPedidoProveedor.PENDIENTE
    assert len(pedido.items) == 1


def test_leer_pedido_proveedor_inexistente_error(db_session):
    with pytest.raises(exceptions.PedidoProveedorNoEncontrado):
        services.leer_pedido_proveedor(db_session, 99999)


def test_crear_pedido_proveedor_exitoso(db_session, unico_proveedor, unico_insumo):
    db_session.add(ProveedorInsumo(proveedor_id=unico_proveedor.id, insumo_id=unico_insumo.id))
    db_session.commit()

    datos = schemas.PedidoProveedorCreate(
        proveedor_id=unico_proveedor.id,
        fecha_entrega_estimada=date.today() + timedelta(days=5),
        observacion="Urgente",
        items=[schemas.PedidoProveedorItemCreate(insumo_id=unico_insumo.id, cantidad_pedida=80)],
    )

    nuevo = services.crear_pedido_proveedor(db_session, datos, usuario_id=1)

    assert nuevo.id is not None
    assert nuevo.estado == EstadoPedidoProveedor.PENDIENTE
    assert nuevo.activo is True
    assert len(nuevo.items) == 1
    assert nuevo.items[0].cantidad_pedida == 80


def test_crear_pedido_proveedor_insumo_no_asociado_error(db_session, unico_proveedor, unico_insumo):
    datos = schemas.PedidoProveedorCreate(
        proveedor_id=unico_proveedor.id,
        items=[schemas.PedidoProveedorItemCreate(insumo_id=unico_insumo.id, cantidad_pedida=25)],
    )

    with pytest.raises(exceptions.InsumoNoPerteneceAProveedor):
        services.crear_pedido_proveedor(db_session, datos, usuario_id=1)


def test_crear_pedido_proveedor_habilitacion_vencida_error(db_session, multiples_proveedores, unico_insumo):
    proveedor_vencido = multiples_proveedores[1]
    datos = schemas.PedidoProveedorCreate(
        proveedor_id=proveedor_vencido.id,
        items=[schemas.PedidoProveedorItemCreate(insumo_id=unico_insumo.id, cantidad_pedida=10)],
    )

    with pytest.raises(exceptions.HabilitacionProveedorVencida):
        services.crear_pedido_proveedor(db_session, datos, usuario_id=1)


def test_modificar_pedido_proveedor_exitoso(db_session, unico_pedido_proveedor, unico_insumo):
    datos = schemas.PedidoProveedorUpdate(
        fecha_entrega_estimada=date.today() + timedelta(days=10),
        observacion="Actualizado",
        items=[schemas.PedidoProveedorItemCreate(insumo_id=unico_insumo.id, cantidad_pedida=150)],
    )

    actualizado = services.modificar_pedido_proveedor(db_session, unico_pedido_proveedor.id, datos)
    assert actualizado.observacion == "Actualizado"
    assert actualizado.items[0].cantidad_pedida == 150


def test_cambiar_estado_pedido_proveedor(db_session, unico_pedido_proveedor):
    assert unico_pedido_proveedor.activo is True
    baja = services.cambiar_estado_pedido_proveedor(db_session, unico_pedido_proveedor.id)
    assert baja.activo is False

    alta = services.cambiar_estado_pedido_proveedor(db_session, unico_pedido_proveedor.id)
    assert alta.activo is True


def test_modificar_pedido_recibido_error(db_session, multiples_pedidos_proveedor, unico_insumo):
    pedido_recibido = multiples_pedidos_proveedor[1]
    datos = schemas.PedidoProveedorUpdate(
        items=[schemas.PedidoProveedorItemCreate(insumo_id=unico_insumo.id, cantidad_pedida=200)]
    )

    with pytest.raises(exceptions.PedidoNoEditable):
        services.modificar_pedido_proveedor(db_session, pedido_recibido.id, datos)