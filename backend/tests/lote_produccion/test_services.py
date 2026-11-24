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
        cantidad_disponible=100
    )
    
    nuevo = services.crear_lote_produccion(db=db_session, lote=datos, usuario_id=1)

    assert nuevo.id is not None
    assert nuevo.producto_id == unico_producto.id
    assert nuevo.cantidad_producida == 100
    assert nuevo.estado == "En produccion"
    assert nuevo.activo is True


def test_crear_lote_con_producto_inactivo(db_session, unico_producto):
    producto_services.cambiar_estado_producto(db=db_session, producto_id=unico_producto.id)

    datos = schemas.LoteProduccionCreate(
        producto_id=unico_producto.id,
        fecha_produccion=date(2027, 10, 1),
        fecha_vencimiento=date(2028, 10, 1),
        cantidad_producida=50,
        cantidad_disponible=50
    )

    with pytest.raises(exceptions.ProductoDadoDeBaja):
        services.crear_lote_produccion(db=db_session, lote=datos, usuario_id=1)


def test_listar_lotes_produccion(db_session, multiples_lotes_produccion, unico_producto):
    lotes = services.listar_lotes_produccion(db=db_session)

    assert len(lotes) == 3
    assert lotes[0].producto_id == unico_producto.id


def test_listar_lotes_historial(db_session, multiples_lotes_produccion, unico_producto):
    historial = services.listar_lotes_historial(db=db_session)

    assert len(historial.lotes) == 3
    assert historial.lotes[0].producto_id == unico_producto.id
    assert historial.total_producido is None


def test_listar_lotes_historial_por_producto(db_session, multiples_lotes_produccion, unico_producto):
    historial = services.listar_lotes_historial(db=db_session, producto_id=unico_producto.id,)

    assert len(historial.lotes) == 3
    assert all(lote.producto_id == unico_producto.id for lote in historial.lotes)
    assert historial.total_producido == sum(lote.cantidad_producida for lote in historial.lotes)


def test_listar_lotes_historial_por_fecha(db_session, multiples_lotes_produccion):
    historial = services.listar_lotes_historial(db=db_session, fecha_desde=date(2027, 10, 1), fecha_hasta=date(2027, 10, 31),)

    assert all(date(2027, 10, 1) <= lote.fecha_produccion <= date(2027, 10, 31) for lote in historial.lotes)
    assert historial.total_producido is None


def test_leer_lote_produccion(db_session, unico_lote_produccion, unico_producto):
    lote = services.leer_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id)

    assert lote.id == unico_lote_produccion.id
    assert lote.producto_id == unico_producto.id
    assert lote.estado == "En produccion"


def test_leer_lote_produccion_no_encontrado(db_session):
    with pytest.raises(exceptions.LoteProduccionNoEncontrado):
        services.leer_lote_produccion(db=db_session, lote_id=999)


def test_modificar_lote_produccion(db_session, unico_lote_produccion, unico_producto):
    datos = schemas.LoteProduccionUpdate(
        producto_id=unico_producto.id,
        fecha_produccion=date(2027, 11, 1),
        fecha_vencimiento=date(2028, 11, 1),
        cantidad_producida=250,
        cantidad_disponible=250
    )
    actualizado = services.modificar_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id, lote=datos)

    assert actualizado.cantidad_producida == 250


def test_cambiar_estado_secuencial_lote_produccion(db_session, unico_lote_produccion):
    lote = services.cambiar_estado_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id, usuario_id=1)
    assert lote.estado == "Empaquetando"

    for item in db_session.query(services.supervision_services.SupervisionOcurrencia).filter_by(
        lote_produccion_id=unico_lote_produccion.id
    ).all():
        item.estado = services.supervision_services.EstadoSupervisionOcurrencia.COMPLETADA
    db_session.commit()

    lote = services.cambiar_estado_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id, usuario_id=1)
    assert lote.estado == "Terminado"

    with pytest.raises(exceptions.LoteYaEnviado):
        services.cambiar_estado_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id, usuario_id=1)


def test_modificar_lote_produccion_enviado(db_session, unico_lote_produccion, unico_producto):
    services.cambiar_estado_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id, usuario_id=1)

    for item in db_session.query(services.supervision_services.SupervisionOcurrencia).filter_by(
        lote_produccion_id=unico_lote_produccion.id
    ).all():
        item.estado = services.supervision_services.EstadoSupervisionOcurrencia.COMPLETADA
    db_session.commit()

    services.cambiar_estado_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id, usuario_id=1)
    
    unico_lote_produccion.estado = "Enviado"
    db_session.commit()

    datos = schemas.LoteProduccionUpdate(
        producto_id=unico_producto.id,
        fecha_produccion=date(2027, 11, 1),
        fecha_vencimiento=date(2028, 11, 1),
        cantidad_producida=300,
    )

    with pytest.raises(exceptions.LoteProduccionDadoDeBaja):
        services.modificar_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id, lote=datos)


def test_reactivar_lote_con_producto_inactivo(db_session, unico_lote_produccion, unico_producto):
    services.cambiar_estado_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id, usuario_id=1)

    producto_services.cambiar_estado_producto(db=db_session, producto_id=unico_producto.id)

    with pytest.raises(exceptions.ProductoDadoDeBaja):
        services.cambiar_estado_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id, usuario_id=1)


def test_estadistica_produccion(db_session, lotes_estadistica):
    estadisticas = services.obtener_estadisticas_produccion(
        db=db_session,
        fecha_desde=date(2026, 10, 10),
        fecha_hasta=date(2026, 10, 10)
    )

    assert len(estadisticas) == 2

    cantidades = {
        estadistica.producto_id: estadistica.cantidad
        for estadistica in estadisticas
    }

    assert cantidades[lotes_estadistica[0].producto_id] == 150
    assert cantidades[lotes_estadistica[3].producto_id] == 70


def test_estadistica_filtrar_producto(db_session, lotes_estadistica):
    estadisticas = services.obtener_estadisticas_produccion(
        db=db_session,
        fecha_desde=date(2026, 10, 1),
        fecha_hasta=date(2026, 10, 31),
        producto_id=lotes_estadistica[3].producto_id
    )

    assert len(estadisticas) == 1
    assert estadisticas[0].producto_id == lotes_estadistica[3].producto_id
    assert estadisticas[0].cantidad == 70


def test_estadistica_filtrar_fechas(db_session, lotes_estadistica):
    estadisticas = services.obtener_estadisticas_produccion(
        db=db_session,
        fecha_desde=date(2026, 10, 11),
        fecha_hasta=date(2026, 10, 19)
    )

    assert len(estadisticas) == 1
    assert estadisticas[0].fecha == date(2026, 10, 11)
    assert estadisticas[0].cantidad == 30


def test_asociar_insumos_correctamente(db_session, unico_lote_produccion, insumos_para_lote):
    insumo_lote1, insumo_lote2 = insumos_para_lote

    datos = schemas.InsumosUtilizadosCreate(insumos=[
        schemas.InsumoUtilizadoCreate(insumo_lote_id=insumo_lote1.id, cantidad_utilizada=100),
        schemas.InsumoUtilizadoCreate(insumo_lote_id=insumo_lote2.id, cantidad_utilizada=3)
    ])

    resultado = services.asociar_insumos_lote(db=db_session, lote_id=unico_lote_produccion.id, datos=datos)

    ids_asociados = {item.insumo_lote_id: item.cantidad_utilizada for item in resultado}
    assert ids_asociados[insumo_lote1.id] == 100
    assert ids_asociados[insumo_lote2.id] == 3

    asociados = services.listar_insumos_lote(db=db_session, lote_id=unico_lote_produccion.id)
    assert len(asociados) == 3

    # Al asociar se descuenta el stock del lote de insumo
    db_session.refresh(insumo_lote1)
    assert insumo_lote1.cantidad_restante == 400


def test_asociar_insumo_duplicado(db_session, unico_lote_produccion, insumos_para_lote):
    insumo_lote = insumos_para_lote[0]

    datos = schemas.InsumosUtilizadosCreate(insumos=[
        schemas.InsumoUtilizadoCreate(insumo_lote_id=insumo_lote.id, cantidad_utilizada=100),
        schemas.InsumoUtilizadoCreate(insumo_lote_id=insumo_lote.id, cantidad_utilizada=50)
    ])

    with pytest.raises(exceptions.InsumoRepetido):
        services.asociar_insumos_lote(db=db_session, lote_id=unico_lote_produccion.id, datos=datos)

    asociados = services.listar_insumos_lote(db=db_session, lote_id=unico_lote_produccion.id)
    assert len(asociados) == 1


def test_modificar_insumos_asociados(db_session, unico_lote_produccion, insumos_para_lote):
    insumo_lote1, insumo_lote2 = insumos_para_lote

    datos = schemas.InsumosUtilizadosCreate(insumos=[
        schemas.InsumoUtilizadoCreate(insumo_lote_id=insumo_lote1.id, cantidad_utilizada=100),
        schemas.InsumoUtilizadoCreate(insumo_lote_id=insumo_lote2.id, cantidad_utilizada=20)
    ])

    services.asociar_insumos_lote(db=db_session, lote_id=unico_lote_produccion.id, datos=datos)

    datos_actualizados = schemas.InsumosUtilizadosUpdate(insumos=[
        schemas.InsumoUtilizadoCreate(insumo_lote_id=insumo_lote1.id, cantidad_utilizada=150)
    ])

    resultado = services.actualizar_insumos_lote(db=db_session, lote_id=unico_lote_produccion.id, datos=datos_actualizados)

    assert len(resultado) == 1
    assert resultado[0].insumo_lote_id == insumo_lote1.id
    assert resultado[0].cantidad_utilizada == 150

    asociados = services.listar_insumos_lote(db=db_session, lote_id=unico_lote_produccion.id)
    assert len(asociados) == 1


def test_historial_estados_lote_service(db_session, unico_lote_produccion):

    lote = services.cambiar_estado_lote_produccion(db=db_session, lote_id=unico_lote_produccion.id, observacion="Paso a empaquetado sin errores.", usuario_id=1)

    historial = services.listar_historial_lote(db=db_session, lote_id=lote.id)

    assert len(historial) >= 1
    ultimo = historial[-1]
    assert ultimo.estado == lote.estado
    assert ultimo.observacion == "Paso a empaquetado sin errores."
    assert ultimo.usuario_id == 1
    assert ultimo.fecha_hora is not None


def test_asociar_insumo_decimal_lanza_error(db_session, unico_lote_produccion, insumos_para_lote):
    insumo_lote = insumos_para_lote[0]
    datos = schemas.InsumosUtilizadosCreate(insumos=[
        schemas.InsumoUtilizadoCreate(insumo_lote_id=insumo_lote.id, cantidad_utilizada=2.5)
    ])
    with pytest.raises(exceptions.CantidadInsumoNoEntera):
        services.asociar_insumos_lote(db=db_session, lote_id=unico_lote_produccion.id, datos=datos)


def test_bloqueo_avance_sin_receta_lote(db_session, unico_producto):
    lote_sin_receta = services.crear_lote_produccion(
        db=db_session,
        lote=schemas.LoteProduccionCreate(
            producto_id=unico_producto.id,
            fecha_produccion=date(2026, 10, 1),
            fecha_vencimiento=date(2027, 10, 1),
            cantidad_producida=5,
        ),
        usuario_id=1,
    )
    with pytest.raises(exceptions.LoteSinRecetaParaAvanzar):
        services.cambiar_estado_lote_produccion(db=db_session, lote_id=lote_sin_receta.id, usuario_id=1)


def test_bloqueo_avance_insumos_insuficientes_y_redondeo_ceil(db_session, unico_producto, unica_receta, unico_insumo_lote):
    lote = services.crear_lote_produccion(
        db=db_session,
        lote=schemas.LoteProduccionCreate(
            producto_id=unico_producto.id,
            fecha_produccion=date(2026, 10, 1),
            fecha_vencimiento=date(2027, 10, 1),
            cantidad_producida=5,
        ),
        usuario_id=1,
    )
    for item in db_session.query(services.supervision_services.SupervisionOcurrencia).filter_by(
        lote_produccion_id=lote.id
    ).all():
        item.estado = services.supervision_services.EstadoSupervisionOcurrencia.COMPLETADA
    db_session.commit()

    with pytest.raises(exceptions.InsumosInsuficientesParaProduccion):
        services.cambiar_estado_lote_produccion(db=db_session, lote_id=lote.id, usuario_id=1)

    services.asociar_insumos_lote(
        db=db_session,
        lote_id=lote.id,
        datos=schemas.InsumosUtilizadosCreate(insumos=[
            schemas.InsumoUtilizadoCreate(insumo_lote_id=unico_insumo_lote.id, cantidad_utilizada=1)
        ]),
    )
    avanzado = services.cambiar_estado_lote_produccion(db=db_session, lote_id=lote.id, usuario_id=1)
    assert avanzado.estado == "Empaquetando"


def test_asociar_insumo_excede_receta_lanza_error(db_session, unico_producto, unica_receta, unico_insumo_lote):
    lote = services.crear_lote_produccion(
        db=db_session,
        lote=schemas.LoteProduccionCreate(
            producto_id=unico_producto.id,
            fecha_produccion=date(2026, 10, 1),
            fecha_vencimiento=date(2027, 10, 1),
            cantidad_producida=5,
        ),
        usuario_id=1,
    )
    with pytest.raises(exceptions.CantidadInsumoExcedeReceta):
        services.asociar_insumos_lote(
            db=db_session,
            lote_id=lote.id,
            datos=schemas.InsumosUtilizadosCreate(insumos=[
                schemas.InsumoUtilizadoCreate(insumo_lote_id=unico_insumo_lote.id, cantidad_utilizada=2)
            ]),
        )
