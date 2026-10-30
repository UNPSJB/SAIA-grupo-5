import pytest
from src.unidad_medida import services, schemas, exceptions


def test_crear_unidad_medida(db_session):
    datos = schemas.UnidadMedidaCreate(nombre = "Mililitro")
    
    nueva = services.crear_unidad_medida(db = db_session, unidad_medida = datos)

    assert nueva.id is not None
    assert nueva.nombre == "Mililitro"
    assert nueva.activo is True


def test_crear_unidad_medida_duplicada(db_session, unica_unidad_medida):
    datos = schemas.UnidadMedidaCreate(nombre = "Kilogramo")
    with pytest.raises(exceptions.UnidadMedidaDuplicada):
        services.crear_unidad_medida(db = db_session, unidad_medida=datos)


def test_listar_unidad_medida(db_session, multiples_unidades_medida):
    unidades = services.listar_unidad_medida(db = db_session)

    assert len(unidades) == 3
    assert unidades[0].nombre == "Kilogramo"


def test_leer_unidad_medida(db_session, unica_unidad_medida):
    unidad = services.leer_unidad_medida(db=db_session, unidad_medida_id = unica_unidad_medida.id)

    assert unidad.id == unica_unidad_medida.id
    assert unidad.nombre == "Kilogramo"


def test_leer_unidad_medida_no_encontrada(db_session):
    with pytest.raises(exceptions.UnidadMedidaNoEncontrada):
        services.leer_unidad_medida(db = db_session, unidad_medida_id = 999)


def test_modificar_unidad_medida(db_session, unica_unidad_medida):
    datos = schemas.UnidadMedidaUpdate(nombre="Tonelada")
    actualizada = services.modificar_unidad_medida(db = db_session,
                    unidad_medida_id = unica_unidad_medida.id, unidad_medida = datos)

    assert actualizada.nombre == "Tonelada"


def test_cambiar_estado_unidad_medida(db_session, unica_unidad_medida):
    actualizada = services.cambiar_estado_unidad_medida(db = db_session, 
                        unidad_medida_id = unica_unidad_medida.id)

    assert actualizada.activo is False


def test_modificar_unidad_medida_dada_de_baja(db_session, unica_unidad_medida):
    services.cambiar_estado_unidad_medida(db = db_session, unidad_medida_id = unica_unidad_medida.id)

    datos = schemas.UnidadMedidaUpdate(nombre="Tonelada")

    with pytest.raises(exceptions.UnidadMedidaDadaDeBaja):
        services.modificar_unidad_medida(db=db_session, 
                    unidad_medida_id=unica_unidad_medida.id, unidad_medida=datos)