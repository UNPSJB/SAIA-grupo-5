import pytest
from src.registro_temperatura import exceptions, schemas, services


def test_registrar_temperatura_en_rango_service(db_session, unico_equipo_frio, persona_supervisor):
    datos = schemas.RegistroTemperaturaCreate(equipo_id=unico_equipo_frio.id,temperatura_registrada=3.0)

    registro = services.registrar_temperatura(db=db_session, datos=datos, usuario=persona_supervisor)

    assert registro.id is not None
    assert registro.equipo_id == unico_equipo_frio.id
    assert registro.fuera_de_rango is False
    assert registro.accion_tomada is None


def test_registrar_temperatura_fuera_rango_sin_accion_service(db_session, unico_equipo_frio, persona_supervisor):
    datos = schemas.RegistroTemperaturaCreate(equipo_id=unico_equipo_frio.id,temperatura_registrada=8.5)

    with pytest.raises(exceptions.AccionTomadaRequerida):
        services.registrar_temperatura(db=db_session, datos=datos, usuario=persona_supervisor)


def test_registrar_temperatura_equipo_sin_control_service(db_session, unico_equipo_sin_control, persona_supervisor):
    datos = schemas.RegistroTemperaturaCreate(equipo_id=unico_equipo_sin_control.id,temperatura_registrada=4.0)

    with pytest.raises(exceptions.EquipoNoControlaTemperatura):
        services.registrar_temperatura(db=db_session, datos=datos, usuario=persona_supervisor)


def test_listar_registros_por_equipo_y_solo_alertas_service(db_session, unico_equipo_frio, multiples_registros_temperatura):
    todos = services.listar_registros_por_equipo(db=db_session, equipo_id=unico_equipo_frio.id)
    alertas = services.listar_registros_por_equipo(db=db_session, equipo_id=unico_equipo_frio.id, solo_alertas=True)

    assert len(todos) == 2
    assert len(alertas) == 1
    assert alertas[0].fuera_de_rango is True


def test_listar_equipos_pendientes_hoy_service(db_session, unico_equipo_frio, persona_supervisor):
    pendientes_antes = services.listar_equipos_pendientes_hoy(db=db_session)
    assert any(item.id == unico_equipo_frio.id for item in pendientes_antes)

    services.registrar_temperatura(
        db=db_session,
        datos=schemas.RegistroTemperaturaCreate(
            equipo_id=unico_equipo_frio.id,
            temperatura_registrada=3.5,
        ),
        usuario=persona_supervisor,
    )

    pendientes_despues = services.listar_equipos_pendientes_hoy(db=db_session)
    assert all(item.id != unico_equipo_frio.id for item in pendientes_despues)


def test_registrar_temperatura_fuera_rango_y_reubicar_mercaderia_service(db_session, multiples_equipos_frio, unico_insumo_lote, unico_lote_produccion, persona_supervisor):
    equipo_origen, equipo_destino = multiples_equipos_frio

    unico_insumo_lote.equipo_id = equipo_origen.id
    unico_insumo_lote.sector_id = equipo_origen.sector_id
    unico_lote_produccion.equipo_id = equipo_origen.id
    unico_lote_produccion.sector_id = equipo_origen.sector_id
    db_session.commit()

    datos = schemas.RegistroTemperaturaCreate(
        equipo_id=equipo_origen.id,
        temperatura_registrada=10.5,
        accion_tomada="Se traslado mercaderia a Camara Frigorifica 2",
        reubicar_mercaderia=True,
        destino_equipo_id=equipo_destino.id,
        insumos_ids_a_mover=[unico_insumo_lote.id],
        lotes_ids_a_mover=[unico_lote_produccion.id],
    )
    resultado = services.registrar_temperatura(db=db_session, datos=datos, usuario=persona_supervisor)

    assert resultado.fuera_de_rango is True
    assert len(resultado.almacenamiento_afectado.insumos) == 1
    assert len(resultado.almacenamiento_afectado.lotes_produccion) == 1

    db_session.refresh(unico_insumo_lote)
    db_session.refresh(unico_lote_produccion)
    assert unico_insumo_lote.equipo_id == equipo_destino.id
    assert unico_lote_produccion.equipo_id == equipo_destino.id
