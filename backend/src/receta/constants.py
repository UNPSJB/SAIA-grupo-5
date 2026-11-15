from enum import Enum


class ErrorCode:
    RECETA_NO_ENCONTRADA = "La receta no fue encontrada."
    RECETA_DUPLICADA = "El producto ya tiene una receta vigente."
    RECETA_SOLO_LECTURA = "La versión de la receta no está vigente y es de solo lectura."
    RECETA_SIN_INGREDIENTES = "La receta debe tener al menos un ingrediente."
    ADITIVO_SIN_CLASE_FUNCIONAL = "Cada aditivo de la receta debe indicar su clase funcional, nombre y número INS."
    INGREDIENTE_CON_ADITIVO = "Un renglón clasificado como ingrediente no puede tener un aditivo asociado."
    ADITIVO_NO_DISPONIBLE = "El aditivo seleccionado no existe o está dado de baja."
    PORCION_INCOMPLETA = "Si se indica la porción o unidad de venta deben completarse la cantidad y la unidad de medida."
    UNIDAD_MEDIDA_NO_DISPONIBLE = "La unidad de medida indicada no existe o está dada de baja."
    INSUMO_REPETIDO = "Un insumo no puede repetirse en el listado de ingredientes de la receta."
    INSUMO_NO_ALIMENTARIO = "Solo se pueden agregar a la receta insumos generales activos."


class TipoRenglon(str, Enum):
    INGREDIENTE = "Ingrediente"
    ADITIVO = "Aditivo"


class SelloFrontal:
    EXCESO_AZUCARES = "EXCESO EN AZÚCARES"
    EXCESO_GRASAS_TOTALES = "EXCESO EN GRASAS TOTALES"
    EXCESO_GRASAS_SATURADAS = "EXCESO EN GRASAS SATURADAS"
    EXCESO_SODIO = "EXCESO EN SODIO"
    EXCESO_CALORIAS = "EXCESO EN CALORÍAS"


KCAL_POR_GRAMO_AZUCAR = 4
KCAL_POR_GRAMO_GRASA = 9

LIMITE_PORCENTAJE_AZUCARES = 0.10
LIMITE_PORCENTAJE_GRASAS_TOTALES = 0.30
LIMITE_PORCENTAJE_GRASAS_SATURADAS = 0.10
LIMITE_SODIO_POR_KCAL = 1
LIMITE_SODIO_CADA_100 = 300
LIMITE_KCAL_SOLIDOS_CADA_100 = 275
LIMITE_KCAL_LIQUIDOS_CADA_100 = 70
LIMITE_AZUCARES_LIQUIDOS_CADA_100 = 10

FACTORES_UNIDAD_MEDIDA = {
    "g": 1,
    "gr": 1,
    "gramo": 1,
    "gramos": 1,
    "kg": 1000,
    "kilo": 1000,
    "kilos": 1000,
    "kilogramo": 1000,
    "kilogramos": 1000,
    "mg": 0.001,
    "miligramo": 0.001,
    "miligramos": 0.001,
    "ml": 1,
    "cc": 1,
    "mililitro": 1,
    "mililitros": 1,
    "l": 1000,
    "lt": 1000,
    "litro": 1000,
    "litros": 1000,
}

UNIDADES_MEDIDA_LIQUIDAS = {"ml", "cc", "mililitro", "mililitros", "l", "lt", "litro", "litros"}

UNIDADES_DE_PRODUCTO = {"unidad": 1, "unidades": 1, "docena": 12, "docenas": 12}
