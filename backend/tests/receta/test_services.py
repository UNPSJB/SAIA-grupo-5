import pytest
from src.receta import services, schemas, exceptions
from src.receta.constants import SelloFrontal
from src.producto.exceptions import ProductoNoEncontrado


def test_evaluar_sellos_con_todos_los_sellos(db_session, producto_solido, insumos_sellos):
    datos = schemas.EvaluacionSellosCreate(producto_id=producto_solido.id, insumos=[
        schemas.InsumoRecetaCreate(insumo_id=insumos_sellos["Harina"].id, cantidad=60),
        schemas.InsumoRecetaCreate(insumo_id=insumos_sellos["Azúcar"].id, cantidad=20),
        schemas.InsumoRecetaCreate(insumo_id=insumos_sellos["Manteca"].id, cantidad=20),
        schemas.InsumoRecetaCreate(insumo_id=insumos_sellos["Sal"].id, cantidad=1),
    ])

    evaluacion = services.evaluar_sellos_receta(db=db_session, datos=datos)

    assert evaluacion.evaluable is True
    assert evaluacion.es_liquido is False
    assert evaluacion.valor_energetico == 441.8
    assert evaluacion.sellos == [
        SelloFrontal.EXCESO_AZUCARES,
        SelloFrontal.EXCESO_GRASAS_TOTALES,
        SelloFrontal.EXCESO_GRASAS_SATURADAS,
        SelloFrontal.EXCESO_SODIO,
        SelloFrontal.EXCESO_CALORIAS,
    ]


def test_evaluar_sellos_sin_exceso(db_session, producto_solido, insumos_sellos):
    datos = schemas.EvaluacionSellosCreate(producto_id=producto_solido.id, insumos=[
        schemas.InsumoRecetaCreate(insumo_id=insumos_sellos["Harina"].id, cantidad=50),
        schemas.InsumoRecetaCreate(insumo_id=insumos_sellos["Agua"].id, cantidad=50),
    ])

    evaluacion = services.evaluar_sellos_receta(db=db_session, datos=datos)

    assert evaluacion.evaluable is True
    assert evaluacion.sellos == []


def test_evaluar_sellos_calorias_sin_otro_sello(db_session, producto_solido, insumos_sellos):
    datos = schemas.EvaluacionSellosCreate(producto_id=producto_solido.id, insumos=[
        schemas.InsumoRecetaCreate(insumo_id=insumos_sellos["Harina"].id, cantidad=100),
    ])

    evaluacion = services.evaluar_sellos_receta(db=db_session, datos=datos)

    assert evaluacion.valor_energetico == 364
    assert evaluacion.sellos == []


def test_evaluar_sellos_liquido_azucarado(db_session, producto_liquido, insumos_sellos):
    datos = schemas.EvaluacionSellosCreate(producto_id=producto_liquido.id, insumos=[
        schemas.InsumoRecetaCreate(insumo_id=insumos_sellos["Agua"].id, cantidad=450),
        schemas.InsumoRecetaCreate(insumo_id=insumos_sellos["Azúcar"].id, cantidad=50),
    ])

    evaluacion = services.evaluar_sellos_receta(db=db_session, datos=datos)

    assert evaluacion.es_liquido is True
    assert evaluacion.valor_energetico == 40
    assert evaluacion.azucares_anadidos == 10
    assert evaluacion.sellos == [SelloFrontal.EXCESO_AZUCARES, SelloFrontal.EXCESO_CALORIAS]


def test_evaluar_sellos_exceso_de_sodio(db_session, producto_liquido, insumos_sellos):
    datos = schemas.EvaluacionSellosCreate(producto_id=producto_liquido.id, insumos=[
        schemas.InsumoRecetaCreate(insumo_id=insumos_sellos["Caldo"].id, cantidad=500),
    ])

    evaluacion = services.evaluar_sellos_receta(db=db_session, datos=datos)

    assert evaluacion.sellos == [SelloFrontal.EXCESO_SODIO]


def test_evaluar_sellos_producto_por_unidad(db_session, producto_por_unidad, insumos_sellos):
    datos = schemas.EvaluacionSellosCreate(producto_id=producto_por_unidad.id, insumos=[
        schemas.InsumoRecetaCreate(insumo_id=insumos_sellos["Huevo"].id, cantidad=2),
        schemas.InsumoRecetaCreate(insumo_id=insumos_sellos["Esencia"].id, cantidad=5),
    ])

    evaluacion = services.evaluar_sellos_receta(db=db_session, datos=datos)

    assert evaluacion.evaluable is True
    assert evaluacion.cantidad_base == 100
    assert evaluacion.valor_energetico == 143
    assert evaluacion.insumos_sin_informacion == ["Esencia"]
    assert SelloFrontal.EXCESO_GRASAS_TOTALES in evaluacion.sellos


def test_evaluar_sellos_sin_insumos(db_session, producto_solido):
    datos = schemas.EvaluacionSellosCreate(producto_id=producto_solido.id, insumos=[])

    evaluacion = services.evaluar_sellos_receta(db=db_session, datos=datos)

    assert evaluacion.evaluable is False
    assert evaluacion.sellos == []


def test_evaluar_sellos_insumo_repetido(db_session, producto_solido, insumos_sellos):
    datos = schemas.EvaluacionSellosCreate(producto_id=producto_solido.id, insumos=[
        schemas.InsumoRecetaCreate(insumo_id=insumos_sellos["Azúcar"].id, cantidad=10),
        schemas.InsumoRecetaCreate(insumo_id=insumos_sellos["Azúcar"].id, cantidad=20),
    ])

    with pytest.raises(exceptions.InsumoRepetido):
        services.evaluar_sellos_receta(db=db_session, datos=datos)


def test_evaluar_sellos_insumo_inactivo(db_session, producto_solido, insumos_sellos):
    datos = schemas.EvaluacionSellosCreate(producto_id=producto_solido.id, insumos=[
        schemas.InsumoRecetaCreate(insumo_id=insumos_sellos["Colorante"].id, cantidad=1),
    ])

    with pytest.raises(exceptions.InsumoNoAlimentario):
        services.evaluar_sellos_receta(db=db_session, datos=datos)


def test_evaluar_sellos_producto_no_encontrado(db_session):
    datos = schemas.EvaluacionSellosCreate(producto_id=999, insumos=[])

    with pytest.raises(ProductoNoEncontrado):
        services.evaluar_sellos_receta(db=db_session, datos=datos)
