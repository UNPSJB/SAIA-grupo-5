from src.insumos.models import Insumo
from src.producto.models import Producto
from src.unidad_medida.models import UnidadMedida
from src.receta.constants import SelloFrontal
from src.receta.sellos import evaluar_sellos


def _insumo(nombre, unidad, valor_energetico=None, azucares=None, grasas=None, saturadas=None, sodio=None, peso_unidad=None):
    return Insumo(
        nombre=nombre,
        unidad_medida=UnidadMedida(nombre=unidad),
        valor_energetico=valor_energetico,
        azucares_anadidos=azucares,
        grasas_totales=grasas,
        grasas_saturadas=saturadas,
        sodio=sodio,
        peso_unidad=peso_unidad,
    )


def _producto(unidad, cantidad_neta):
    return Producto(nombre="Producto", unidad_medida=UnidadMedida(nombre=unidad), cantidad_neta=cantidad_neta)


def test_galletita_con_todos_los_sellos():
    insumos = [
        (_insumo("Harina", "Gramo", 364, 0, 1, 0.2, 2), 60),
        (_insumo("Azúcar", "Gramo", 400, 100, 0, 0, 0), 20),
        (_insumo("Manteca", "Kilogramo", 717, 0, 81, 51, 11), 0.02),
        (_insumo("Sal", "Gramo", 0, 0, 0, 0, 38758), 1),
    ]

    resultado = evaluar_sellos(_producto("Gramo", 100), insumos)

    assert resultado.evaluable is True
    assert resultado.es_liquido is False
    assert resultado.valor_energetico == 441.8
    assert resultado.sellos == [
        SelloFrontal.EXCESO_AZUCARES,
        SelloFrontal.EXCESO_GRASAS_TOTALES,
        SelloFrontal.EXCESO_GRASAS_SATURADAS,
        SelloFrontal.EXCESO_SODIO,
        SelloFrontal.EXCESO_CALORIAS,
    ]


def test_producto_sin_exceso_no_lleva_sellos():
    insumos = [
        (_insumo("Harina", "Gramo", 364, 0, 1, 0.2, 2), 50),
        (_insumo("Agua", "Mililitro", 0, 0, 0, 0, 0), 50),
    ]

    resultado = evaluar_sellos(_producto("Gramo", 100), insumos)

    assert resultado.evaluable is True
    assert resultado.sellos == []


def test_liquido_azucarado_lleva_sello_de_calorias_por_azucares():
    insumos = [
        (_insumo("Agua", "Litro", 0, 0, 0, 0, 0), 0.45),
        (_insumo("Azúcar", "Gramo", 400, 100, 0, 0, 0), 50),
    ]

    resultado = evaluar_sellos(_producto("Mililitro", 500), insumos)

    assert resultado.es_liquido is True
    assert resultado.valor_energetico == 40
    assert resultado.azucares_anadidos == 10
    assert resultado.sellos == [SelloFrontal.EXCESO_AZUCARES, SelloFrontal.EXCESO_CALORIAS]


def test_calorias_sin_otro_sello_no_corresponde():
    insumos = [(_insumo("Harina", "Gramo", 364, 0, 1, 0.2, 2), 100)]

    resultado = evaluar_sellos(_producto("Gramo", 100), insumos)

    assert resultado.valor_energetico >= 275
    assert resultado.sellos == []


def test_sodio_por_kcal():
    insumos = [
        (_insumo("Caldo", "Mililitro", 5, 0, 0, 0, 400), 100),
    ]

    resultado = evaluar_sellos(_producto("Mililitro", 100), insumos)

    assert SelloFrontal.EXCESO_SODIO in resultado.sellos


def test_producto_por_unidad_usa_peso_de_ingredientes_e_informa_faltantes():
    insumos = [
        (_insumo("Huevo", "Unidad", 143, 0, 9.5, 3.1, 142, peso_unidad=50), 2),
        (_insumo("Esencia", "Mililitro"), 5),
        (_insumo("Relleno", "Unidad", 300, 10, 10, 5, 100), 1),
    ]

    resultado = evaluar_sellos(_producto("Unidad", 1), insumos)

    assert resultado.evaluable is True
    assert resultado.cantidad_base == 100
    assert resultado.valor_energetico == 143
    assert resultado.insumos_sin_informacion == ["Esencia", "Relleno"]
    assert SelloFrontal.EXCESO_GRASAS_TOTALES in resultado.sellos


def test_sin_insumos_no_es_evaluable():
    resultado = evaluar_sellos(_producto("Gramo", 100), [])

    assert resultado.evaluable is False
    assert resultado.sellos == []
