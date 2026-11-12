import unicodedata
from typing import TYPE_CHECKING
from src.receta import constants
from src.receta.constants import SelloFrontal
from src.receta.schemas import EvaluacionSellos

if TYPE_CHECKING:
    from src.insumos.models import Insumo
    from src.producto.models import Producto
    from src.unidad_medida.models import UnidadMedida


def _normalizar(nombre: str) -> str:
    sin_acentos = unicodedata.normalize("NFKD", nombre).encode("ascii", "ignore").decode()
    return sin_acentos.strip().lower()


def factor_unidad_medida(nombre: str) -> float | None:
    return constants.FACTORES_UNIDAD_MEDIDA.get(_normalizar(nombre))


def es_unidad_liquida(nombre: str) -> bool:
    return _normalizar(nombre) in constants.UNIDADES_MEDIDA_LIQUIDAS


def tiene_informacion_nutricional(insumo: "Insumo") -> bool:
    return all(valor is not None for valor in (
        insumo.valor_energetico,
        insumo.azucares_anadidos,
        insumo.grasas_totales,
        insumo.grasas_saturadas,
        insumo.sodio,
    ))


def _equivalencia_insumo(insumo: "Insumo") -> float | None:
    return factor_unidad_medida(insumo.unidad_medida.nombre) or insumo.peso_unidad


def _cantidad_base(producto: "Producto", masa_total: float, rendimiento: float | None, unidad_rendimiento: "UnidadMedida | None") -> float:
    if rendimiento and unidad_rendimiento is not None:
        factor_rendimiento = factor_unidad_medida(unidad_rendimiento.nombre)
        if factor_rendimiento:
            return rendimiento * factor_rendimiento
        unidades = constants.UNIDADES_DE_PRODUCTO.get(_normalizar(unidad_rendimiento.nombre))
        factor_producto = factor_unidad_medida(producto.unidad_medida.nombre)
        if unidades and factor_producto:
            return rendimiento * unidades * producto.cantidad_neta * factor_producto
    return masa_total


def evaluar_sellos(
    producto: "Producto",
    insumos: list[tuple["Insumo", float]],
    rendimiento: float | None = None,
    unidad_rendimiento: "UnidadMedida | None" = None,
) -> EvaluacionSellos:
    es_liquido = es_unidad_liquida(producto.unidad_medida.nombre)

    masa_total = 0.0
    kcal = azucares = grasas = saturadas = sodio = 0.0
    sin_informacion: list[str] = []

    for insumo, cantidad in insumos:
        equivalencia = _equivalencia_insumo(insumo)
        if not tiene_informacion_nutricional(insumo) or equivalencia is None:
            sin_informacion.append(insumo.nombre)
            continue
        masa = cantidad * equivalencia
        proporcion = masa / 100
        masa_total += masa
        kcal += insumo.valor_energetico * proporcion
        azucares += insumo.azucares_anadidos * proporcion
        grasas += insumo.grasas_totales * proporcion
        saturadas += insumo.grasas_saturadas * proporcion
        sodio += insumo.sodio * proporcion

    cantidad_base = _cantidad_base(producto, masa_total, rendimiento, unidad_rendimiento)

    if masa_total <= 0 or cantidad_base <= 0:
        return EvaluacionSellos(evaluable=False, es_liquido=es_liquido, insumos_sin_informacion=sin_informacion)

    escala = 100 / cantidad_base
    kcal_100 = kcal * escala
    azucares_100 = azucares * escala
    sodio_100 = sodio * escala

    sellos: list[str] = []
    if kcal > 0 and azucares * constants.KCAL_POR_GRAMO_AZUCAR >= kcal * constants.LIMITE_PORCENTAJE_AZUCARES:
        sellos.append(SelloFrontal.EXCESO_AZUCARES)
    if kcal > 0 and grasas * constants.KCAL_POR_GRAMO_GRASA >= kcal * constants.LIMITE_PORCENTAJE_GRASAS_TOTALES:
        sellos.append(SelloFrontal.EXCESO_GRASAS_TOTALES)
    if kcal > 0 and saturadas * constants.KCAL_POR_GRAMO_GRASA >= kcal * constants.LIMITE_PORCENTAJE_GRASAS_SATURADAS:
        sellos.append(SelloFrontal.EXCESO_GRASAS_SATURADAS)
    if sodio > 0 and (sodio >= kcal * constants.LIMITE_SODIO_POR_KCAL or sodio_100 >= constants.LIMITE_SODIO_CADA_100):
        sellos.append(SelloFrontal.EXCESO_SODIO)

    if es_liquido:
        exceso_calorias = kcal_100 >= constants.LIMITE_KCAL_LIQUIDOS_CADA_100 or azucares_100 >= constants.LIMITE_AZUCARES_LIQUIDOS_CADA_100
    else:
        exceso_calorias = kcal_100 >= constants.LIMITE_KCAL_SOLIDOS_CADA_100
    if exceso_calorias and sellos:
        sellos.append(SelloFrontal.EXCESO_CALORIAS)

    return EvaluacionSellos(
        evaluable=True,
        es_liquido=es_liquido,
        cantidad_base=round(cantidad_base, 2),
        valor_energetico=round(kcal_100, 2),
        azucares_anadidos=round(azucares_100, 2),
        grasas_totales=round(grasas * escala, 2),
        grasas_saturadas=round(saturadas * escala, 2),
        sodio=round(sodio_100, 2),
        sellos=sellos,
        insumos_sin_informacion=sin_informacion,
    )
