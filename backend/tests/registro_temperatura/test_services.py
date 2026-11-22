import pytest
from src.auth.utils import get_password_hash
from src.equipos.models import Equipo
from src.personal.models import Persona
from src.registro_temperatura import exceptions, schemas, services
from src.sector.models import Sector


def _crear_datos_base(db_session, controla_temperatura: bool = True):
    sector = Sector(nombre="Deposito Frio", activo=True)
    db_session.add(sector)
    db_session.flush()

    equipo = Equipo(
        nombre="Camara Frigorifica 1",
        categoria="Refrigeracion",
        ubicacion="Ala Norte",
        estado=True,
        sector_id=sector.id,
        controla_temperatura=controla_temperatura,
        temperatura_minima=0.0 if controla_temperatura else None,
        temperatura_maxima=5.0 if controla_temperatura else None,
    )
    db_session.add(equipo)

    operario = Persona(
        nombre="Juan",
        apellido="Perez",
        dni="33445566",
        mail="juan@test.com",
        username="juan_temp",
        hashed_password=get_password_hash("1234"),
        operar=True,
        administrar=False,
        supervisor=False,
        activo=True,
    )
    db_session.add(operario)
    db_session.commit()
    db_session.refresh(equipo)
    db_session.refresh(operario)
    return equipo, operario


def test_registrar_temperatura_en_rango_service(db_session):
    equipo, operario = _crear_datos_base(db_session)
    datos = schemas.RegistroTemperaturaCreate(equipo_id=equipo.id, temperatura_registrada=3.0)

    registro = services.registrar_temperatura(db=db_session, datos=datos, usuario=operario)

    assert registro.id is not None
    assert registro.equipo_id == equipo.id
    assert registro.fuera_de_rango is False
    assert registro.accion_tomada is None


def test_registrar_temperatura_fuera_rango_sin_accion_service(db_session):
    equipo, operario = _crear_datos_base(db_session)
    datos = schemas.RegistroTemperaturaCreate(equipo_id=equipo.id, temperatura_registrada=8.5)

    with pytest.raises(exceptions.AccionTomadaRequerida):
        services.registrar_temperatura(db=db_session, datos=datos, usuario=operario)


def test_registrar_temperatura_equipo_sin_control_service(db_session):
    equipo, operario = _crear_datos_base(db_session, controla_temperatura=False)
    datos = schemas.RegistroTemperaturaCreate(equipo_id=equipo.id, temperatura_registrada=4.0)

    with pytest.raises(exceptions.EquipoNoControlaTemperatura):
        services.registrar_temperatura(db=db_session, datos=datos, usuario=operario)


def test_listar_registros_por_equipo_y_solo_alertas_service(db_session):
    equipo, operario = _crear_datos_base(db_session)

    services.registrar_temperatura(
        db=db_session,
        datos=schemas.RegistroTemperaturaCreate(equipo_id=equipo.id, temperatura_registrada=2.0),
        usuario=operario,
    )
    services.registrar_temperatura(
        db=db_session,
        datos=schemas.RegistroTemperaturaCreate(
            equipo_id=equipo.id,
            temperatura_registrada=9.0,
            accion_tomada="Se ajusto termostato",
        ),
        usuario=operario,
    )

    todos = services.listar_registros_por_equipo(db=db_session, equipo_id=equipo.id)
    alertas = services.listar_registros_por_equipo(db=db_session, equipo_id=equipo.id, solo_alertas=True)

    assert len(todos) == 2
    assert len(alertas) == 1
    assert alertas[0].fuera_de_rango is True


def test_listar_equipos_pendientes_hoy_service(db_session):
    equipo, operario = _crear_datos_base(db_session)

    pendientes_antes = services.listar_equipos_pendientes_hoy(db=db_session)
    assert any(item.id == equipo.id for item in pendientes_antes)

    services.registrar_temperatura(
        db=db_session,
        datos=schemas.RegistroTemperaturaCreate(equipo_id=equipo.id, temperatura_registrada=3.5),
        usuario=operario,
    )

    pendientes_despues = services.listar_equipos_pendientes_hoy(db=db_session)
    assert all(item.id != equipo.id for item in pendientes_despues)


def test_registrar_temperatura_fuera_rango_y_reubicar_mercaderia_service(db_session, unico_insumo_lote, unico_lote_produccion):
    equipo, operario = _crear_datos_base(db_session)
    equipo_destino = Equipo(
        nombre="Camara Frigorifica 2",
        categoria="Refrigeracion",
        ubicacion="Ala Sur",
        estado=True,
        sector_id=equipo.sector_id,
        controla_temperatura=True,
        temperatura_minima=0.0,
        temperatura_maxima=4.0,
    )
    db_session.add(equipo_destino)
    db_session.commit()
    db_session.refresh(equipo_destino)

    unico_insumo_lote.equipo_id = equipo.id
    unico_insumo_lote.sector_id = equipo.sector_id
    unico_lote_produccion.equipo_id = equipo.id
    unico_lote_produccion.sector_id = equipo.sector_id
    db_session.commit()

    datos = schemas.RegistroTemperaturaCreate(
        equipo_id=equipo.id,
        temperatura_registrada=10.5,
        accion_tomada="Se traslado mercaderia a Camara Frigorifica 2",
        reubicar_mercaderia=True,
        destino_equipo_id=equipo_destino.id,
        insumos_ids_a_mover=[unico_insumo_lote.id],
        lotes_ids_a_mover=[unico_lote_produccion.id],
    )
    resultado = services.registrar_temperatura(db=db_session, datos=datos, usuario=operario)

    assert resultado.fuera_de_rango is True
    assert len(resultado.almacenamiento_afectado.insumos) == 1
    assert len(resultado.almacenamiento_afectado.lotes_produccion) == 1

    db_session.refresh(unico_insumo_lote)
    db_session.refresh(unico_lote_produccion)
    assert unico_insumo_lote.equipo_id == equipo_destino.id
    assert unico_lote_produccion.equipo_id == equipo_destino.id
