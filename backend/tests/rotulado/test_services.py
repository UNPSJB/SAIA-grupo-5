import pytest
from src.rotulado import services, schemas, exceptions
from src.rotulado.constants import EstadoRotulado, OBSERVACION_INICIAL
from src.receta.constants import SelloFrontal


def _nuevas_reglas(db_session, **cambios):
    vigentes = schemas.ReglasRotulado.model_validate(services.obtener_reglas_vigentes(db_session))
    datos = vigentes.model_dump(include=set(schemas.ReglasRotuladoBase.model_fields))
    return schemas.ReglasRotuladoCreate(**{**datos, "observacion": "Actualización de prueba", **cambios})


def _declarar(db_session, producto, **datos):
    return services.actualizar_rotulado_producto(db=db_session, producto_id=producto.id,
                                                 datos=schemas.RotuladoProductoUpdate(**datos))


def test_reglas_iniciales_se_crean_automaticamente(db_session):
    reglas = services.obtener_reglas_vigentes(db=db_session)

    assert reglas.version == 1
    assert reglas.vigente is True
    assert reglas.observacion == OBSERVACION_INICIAL
    assert reglas.requiere_envasado_ausencia_cliente is True


def test_rotulado_pendiente_sin_respuesta_de_envasado(db_session, producto_rotulado, con_receta):
    con_receta(("Harina", 80), ("Azúcar", 20))

    evaluacion = services.obtener_rotulado_producto(db=db_session, producto_id=producto_rotulado.id)

    assert evaluacion.estado == EstadoRotulado.PENDIENTE
    assert evaluacion.sellos is None


def test_rotulado_no_corresponde_si_no_se_envasa_en_ausencia_del_cliente(db_session, producto_rotulado, con_receta):
    con_receta(("Harina", 80), ("Azúcar", 20))

    evaluacion = _declarar(db_session, producto_rotulado, envasado_ausencia_cliente=False)

    assert evaluacion.estado == EstadoRotulado.NO_CORRESPONDE
    assert evaluacion.sellos is None


def test_rotulado_exceptuado_sin_agregados(db_session, producto_rotulado, con_receta):
    con_receta(("Harina", 100))

    evaluacion = _declarar(db_session, producto_rotulado, envasado_ausencia_cliente=True)

    assert evaluacion.estado == EstadoRotulado.EXCEPTUADO
    assert evaluacion.sellos is None
    assert all(not marca.valor for marca in evaluacion.marcas)


def test_rotulado_aplica_por_azucares_de_los_ingredientes(db_session, producto_rotulado, con_receta):
    con_receta(("Harina", 70), ("Azúcar", 30))

    evaluacion = _declarar(db_session, producto_rotulado, envasado_ausencia_cliente=True)
    azucares = next(marca for marca in evaluacion.marcas if marca.clave == "azucares")

    assert evaluacion.estado == EstadoRotulado.APLICA
    assert azucares.sugerido is True
    assert azucares.declarado is None
    assert azucares.insumos == ["Azúcar"]
    assert evaluacion.sellos.sellos == [SelloFrontal.EXCESO_AZUCARES, SelloFrontal.EXCESO_CALORIAS]


@pytest.mark.parametrize("insumo, clave", [("Sal", "sodio"), ("Sucralosa", "edulcorantes"), ("Café", "cafeina")])
def test_rotulado_aplica_por_cada_marca(db_session, producto_rotulado, con_receta, insumo, clave):
    con_receta(("Harina", 99), (insumo, 1))

    evaluacion = _declarar(db_session, producto_rotulado, envasado_ausencia_cliente=True)

    assert evaluacion.estado == EstadoRotulado.APLICA
    assert [marca.clave for marca in evaluacion.marcas if marca.valor] == [clave]


def test_corregir_marca_sugerida_por_los_ingredientes(db_session, producto_rotulado, con_receta):
    con_receta(("Harina", 70), ("Azúcar", 30))

    evaluacion = _declarar(db_session, producto_rotulado, envasado_ausencia_cliente=True, azucares_agregados=False)
    azucares = next(marca for marca in evaluacion.marcas if marca.clave == "azucares")

    assert evaluacion.estado == EstadoRotulado.EXCEPTUADO
    assert azucares.sugerido is True
    assert azucares.declarado is False
    assert azucares.valor is False


def test_declarar_marca_sin_ingredientes_que_la_aporten(db_session, producto_rotulado, con_receta):
    con_receta(("Harina", 100))

    evaluacion = _declarar(db_session, producto_rotulado, envasado_ausencia_cliente=True, grasas_agregadas=True)

    assert evaluacion.estado == EstadoRotulado.APLICA


def test_reglas_sin_requisito_de_envasado(db_session, producto_rotulado, con_receta):
    con_receta(("Harina", 70), ("Azúcar", 30))
    services.crear_version_reglas(db=db_session, datos=_nuevas_reglas(db_session, requiere_envasado_ausencia_cliente=False))

    evaluacion = services.obtener_rotulado_producto(db=db_session, producto_id=producto_rotulado.id)

    assert evaluacion.estado == EstadoRotulado.APLICA
    assert evaluacion.reglas_version == 2


def test_reglas_que_no_consideran_cafeina(db_session, producto_rotulado, con_receta):
    con_receta(("Harina", 99), ("Café", 1))
    services.crear_version_reglas(db=db_session, datos=_nuevas_reglas(db_session, aplica_por_cafeina=False))

    evaluacion = _declarar(db_session, producto_rotulado, envasado_ausencia_cliente=True)

    assert evaluacion.estado == EstadoRotulado.EXCEPTUADO


def test_crear_version_de_reglas(db_session):
    anterior = services.obtener_reglas_vigentes(db=db_session)

    nueva = services.crear_version_reglas(db=db_session, datos=_nuevas_reglas(db_session, mensaje_exceptuado="Texto nuevo de excepción"))

    assert nueva.version == 2
    assert nueva.vigente is True
    assert anterior.vigente is False
    assert anterior.fecha_hasta_vigencia == nueva.fecha_desde_vigencia
    assert [reglas.version for reglas in services.listar_versiones_reglas(db=db_session)] == [2, 1]


def test_leer_version_de_reglas_inexistente(db_session):
    with pytest.raises(exceptions.ReglasNoEncontradas):
        services.leer_version_reglas(db=db_session, reglas_id=999)
