class ErrorCode:
    RECETA_NO_ENCONTRADA = "La receta no fue encontrada."
    RECETA_DUPLICADA = "El producto ya tiene una receta vigente."
    INSUMO_REPETIDO = "Un insumo no puede repetirse en el listado de ingredientes de la receta."
    INSUMO_NO_ALIMENTARIO = "Solo se pueden agregar a la receta insumos generales activos."


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
