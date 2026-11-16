import pytest
from datetime import date
from src.envios_lote import services, schemas, exceptions
from src.envios_lote.models import EstadoEnvio
from src.lote_produccion import services as lote_services
from src.lote_produccion.models import EstadoLote
from src.clientes import services as cliente_services




def test_crear_envio_exitoso(db_session, unico_lote_produccion, unico_cliente, unica_direccion_cliente):
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)

    datos = schemas.EnvioLoteCreate(
        lote_id=unico_lote_produccion.id,
        cliente_id=unico_cliente.id,
        direccion_cliente_id=unica_direccion_cliente.id,
        cantidad=40,
        numero_remito="R-0001-00000123",
        transportista="Expreso Trelew",
        fecha_envio=date(2026, 10, 2),
    )

    envio = services.crear_envio(db=db_session, datos=datos)

    assert envio.id is not None
    assert envio.lote_id == unico_lote_produccion.id
    assert envio.cantidad == 40
    assert envio.estado == EstadoEnvio.EN_CAMINO.value
    assert envio.transportista == "Expreso Trelew"

    assert unico_lote_produccion.cantidad_disponible == 60
    assert unico_lote_produccion.estado == EstadoLote.PARCIALMENTE_DESPACHADO.value


def test_crear_envio_agota_lote(db_session, unico_lote_produccion, unico_cliente, unica_direccion_cliente):
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)

    datos = schemas.EnvioLoteCreate(
        lote_id=unico_lote_produccion.id,
        cliente_id=unico_cliente.id,
        direccion_cliente_id=unica_direccion_cliente.id,
        cantidad=100,
        numero_remito="R-0001-00000124",
        transportista="Expreso Trelew",
        fecha_envio=date(2026, 10, 2),
    )

    services.crear_envio(db=db_session, datos=datos)

    assert unico_lote_produccion.cantidad_disponible == 0
    assert unico_lote_produccion.estado == EstadoLote.ENVIADO.value


def test_crear_envio_lote_no_encontrado(db_session, unico_cliente, unica_direccion_cliente):
    datos = schemas.EnvioLoteCreate(
        lote_id=9999,
        cliente_id=unico_cliente.id,
        direccion_cliente_id=unica_direccion_cliente.id,
        cantidad=10,
        numero_remito="R-0001-00000125",
        transportista="Expreso Trelew",
        fecha_envio=date(2026, 10, 2),
    )

    with pytest.raises(exceptions.LoteNoEncontrado):
        services.crear_envio(db=db_session, datos=datos)


def test_crear_envio_lote_no_terminado_error(db_session, unico_lote_produccion, unico_cliente, unica_direccion_cliente):
    datos = schemas.EnvioLoteCreate(
        lote_id=unico_lote_produccion.id,
        cliente_id=unico_cliente.id,
        direccion_cliente_id=unica_direccion_cliente.id,
        cantidad=10,
        numero_remito="R-0001-00000126",
        transportista="Expreso Trelew",
        fecha_envio=date(2026, 10, 2),
    )

    with pytest.raises(exceptions.EstadoLoteInvalido):
        services.crear_envio(db=db_session, datos=datos)


def test_crear_envio_cantidad_invalida_cero(db_session, unico_lote_produccion, unico_cliente, unica_direccion_cliente):
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)

    datos = schemas.EnvioLoteCreate(
        lote_id=unico_lote_produccion.id,
        cliente_id=unico_cliente.id,
        direccion_cliente_id=unica_direccion_cliente.id,
        cantidad=0,
        numero_remito="R-0001-00000127",
        transportista="Expreso Trelew",
        fecha_envio=date(2026, 10, 2),
    )

    with pytest.raises(exceptions.CantidadInvalida):
        services.crear_envio(db=db_session, datos=datos)


def test_crear_envio_stock_insuficiente_error(db_session, unico_lote_produccion, unico_cliente, unica_direccion_cliente):
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)

    datos = schemas.EnvioLoteCreate(
        lote_id=unico_lote_produccion.id,
        cliente_id=unico_cliente.id,
        direccion_cliente_id=unica_direccion_cliente.id,
        cantidad=150,
        numero_remito="R-0001-00000128",
        transportista="Expreso Trelew",
        fecha_envio=date(2026, 10, 2),
    )

    with pytest.raises(exceptions.StockInsuficiente):
        services.crear_envio(db=db_session, datos=datos)


def test_crear_envio_fecha_anterior_a_produccion_error(db_session, unico_lote_produccion, unico_cliente, unica_direccion_cliente):
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)

    datos = schemas.EnvioLoteCreate(
        lote_id=unico_lote_produccion.id,
        cliente_id=unico_cliente.id,
        direccion_cliente_id=unica_direccion_cliente.id,
        cantidad=10,
        numero_remito="R-0001-00000129",
        transportista="Expreso Trelew",
        fecha_envio=date(2026, 9, 15),  
    )

    with pytest.raises(exceptions.FechaEnvioAnteriorAProduccion):
        services.crear_envio(db=db_session, datos=datos)


def test_crear_envio_cliente_inactivo_error(db_session, unico_lote_produccion, multiples_clientes, unica_direccion_cliente):
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)

    cliente_inactivo = multiples_clientes[2] 

    datos = schemas.EnvioLoteCreate(
        lote_id=unico_lote_produccion.id,
        cliente_id=cliente_inactivo.id,
        direccion_cliente_id=unica_direccion_cliente.id,
        cantidad=10,
        numero_remito="R-0001-00000130",
        transportista="Expreso Trelew",
        fecha_envio=date(2026, 10, 2),
    )

    with pytest.raises(exceptions.ClienteDadoDeBaja):
        services.crear_envio(db=db_session, datos=datos)


def test_crear_envio_direccion_no_pertenece_a_cliente(db_session, unico_lote_produccion, multiples_clientes, unica_direccion_cliente):
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id, usuario_id=1)

    otro_cliente = multiples_clientes[0]

    datos = schemas.EnvioLoteCreate(
        lote_id=unico_lote_produccion.id,
        cliente_id=otro_cliente.id,
        direccion_cliente_id=unica_direccion_cliente.id,
        cantidad=10,
        numero_remito="R-0001-00000131",
        transportista="Expreso Trelew",
        fecha_envio=date(2026, 10, 2),
    )

    with pytest.raises(exceptions.DireccionNoPerteneceAlCliente):
        services.crear_envio(db=db_session, datos=datos)



def test_registrar_recepcion_entregado(db_session, unico_envio, unico_lote_produccion):
    datos = schemas.EnvioLoteUpdate(
        recibido=True,
        fecha_entrega=date(2026, 10, 6),
        observaciones="Recibido conforme en planta"
    )

    actualizado = services.registrar_recepcion_envio(db=db_session, envio_id=unico_envio.id, datos=datos)

    assert actualizado.estado == EstadoEnvio.ENTREGADO.value
    assert actualizado.fecha_entrega == date(2026, 10, 6)
    assert actualizado.observaciones == "Recibido conforme en planta"
    assert unico_lote_produccion.cantidad_disponible == 70


def test_registrar_recepcion_rechazado_reintegra_stock(db_session, unico_envio, unico_lote_produccion):
    datos = schemas.EnvioLoteUpdate(
        recibido=False,
        fecha_entrega=date(2026, 10, 6),
        observaciones="Rechazado por problemas en el embalaje"
    )

    actualizado = services.registrar_recepcion_envio(db=db_session, envio_id=unico_envio.id, datos=datos)

    assert actualizado.estado == EstadoEnvio.RECHAZADO.value
    assert actualizado.observaciones == "Rechazado por problemas en el embalaje"

    assert unico_lote_produccion.cantidad_disponible == 100
    assert unico_lote_produccion.estado == EstadoLote.TERMINADO.value


def test_registrar_recepcion_fecha_entrega_invalida(db_session, unico_envio):
    datos = schemas.EnvioLoteUpdate(
        recibido=True,
        fecha_entrega=date(2026, 10, 1), 
        observaciones="Fecha invalida"
    )

    with pytest.raises(exceptions.FechaEntregaAnteriorAEnvio):
        services.registrar_recepcion_envio(db=db_session, envio_id=unico_envio.id, datos=datos)


def test_registrar_recepcion_ya_procesado_error(db_session, unico_envio):
    datos = schemas.EnvioLoteUpdate(
        recibido=True,
        fecha_entrega=date(2026, 10, 6),
    )
    services.registrar_recepcion_envio(db=db_session, envio_id=unico_envio.id, datos=datos)

    with pytest.raises(exceptions.EnvioYaProcesado):
        services.registrar_recepcion_envio(db=db_session, envio_id=unico_envio.id, datos=datos)


def test_descuento_progresivo_y_listado_multiples_envios(db_session, multiples_envios, unico_lote_produccion):
    envios = services.listar_envios_por_lote(db=db_session, lote_id=unico_lote_produccion.id)

    assert len(envios) == 2
    assert envios[0].fecha_envio >= envios[1].fecha_envio
    assert unico_lote_produccion.cantidad_disponible == 30
    assert unico_lote_produccion.estado == EstadoLote.PARCIALMENTE_DESPACHADO.value