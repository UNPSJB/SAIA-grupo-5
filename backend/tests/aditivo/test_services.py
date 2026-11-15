import pytest
from pydantic import ValidationError
from src.aditivo import services, schemas, exceptions


def test_crear_aditivo(db_session):
    datos = schemas.AditivoCreate(clase_funcional="Colorante", nombre="Tartrazina", numero_ins="102")

    nuevo = services.crear_aditivo(db=db_session, aditivo=datos)

    assert nuevo.id is not None
    assert nuevo.clase_funcional == "Colorante"
    assert nuevo.numero_ins == "102"
    assert nuevo.activo is True


def test_crear_aromatizante_sin_numero_ins(db_session):
    datos = schemas.AditivoCreate(clase_funcional="Aromatizante", nombre="Aroma de frutilla")

    nuevo = services.crear_aditivo(db=db_session, aditivo=datos)

    assert nuevo.numero_ins is None


def test_crear_aditivo_sin_numero_ins():
    with pytest.raises(ValidationError):
        schemas.AditivoCreate(clase_funcional="Conservante", nombre="Benzoato de sodio")


def test_crear_aditivo_con_clase_funcional_invalida():
    with pytest.raises(ValidationError):
        schemas.AditivoCreate(clase_funcional="Inventada", nombre="Algo", numero_ins="999")


def test_crear_aditivo_duplicado(db_session, unico_aditivo):
    datos = schemas.AditivoCreate(clase_funcional="Conservante", nombre=unico_aditivo.nombre, numero_ins="203")

    with pytest.raises(exceptions.AditivoDuplicado):
        services.crear_aditivo(db=db_session, aditivo=datos)


def test_crear_aditivo_con_numero_ins_duplicado(db_session, unico_aditivo):
    datos = schemas.AditivoCreate(clase_funcional="Conservante", nombre="Sorbato de calcio", numero_ins=unico_aditivo.numero_ins)

    with pytest.raises(exceptions.NumeroInsDuplicado):
        services.crear_aditivo(db=db_session, aditivo=datos)


def test_listar_aditivos(db_session, multiples_aditivos):
    aditivos = services.listar_aditivos(db=db_session)

    assert [aditivo.nombre for aditivo in aditivos] == ["Ácido ascórbico", "Aroma de vainilla", "Sorbato de potasio"]


def test_leer_aditivo_no_encontrado(db_session):
    with pytest.raises(exceptions.AditivoNoEncontrado):
        services.leer_aditivo(db=db_session, aditivo_id=999)


def test_modificar_aditivo(db_session, unico_aditivo):
    datos = schemas.AditivoUpdate(clase_funcional="Conservante", nombre="Sorbato de potasio E202", numero_ins="202")

    actualizado = services.modificar_aditivo(db=db_session, aditivo_id=unico_aditivo.id, aditivo=datos)

    assert actualizado.nombre == "Sorbato de potasio E202"


def test_cambiar_estado_aditivo(db_session, unico_aditivo):
    actualizado = services.cambiar_estado_aditivo(db=db_session, aditivo_id=unico_aditivo.id)

    assert actualizado.activo is False
