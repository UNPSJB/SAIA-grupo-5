from decimal import Decimal

class ErrorCode:
    CONFIGURACION_NO_ENCONTRADA = "No se encontró la configuración de cálculo nutricional."
    PARAMETROS_NO_ENCONTRADOS = "No se encontraron parámetros de nutrientes configurados."
    RECETA_NO_ENCONTRADA = "La receta no existe."
    INFO_NUTRICIONAL_RECETA_NO_ENCONTRADA = "No hay información nutricional calculada para esta receta."
    RENDIMIENTO_INVALIDO = "El rendimiento de la receta debe ser mayor a cero."
    PORCION_INVALIDA = "La porción de la receta debe ser mayor a cero."
    INSUMO_SIN_INFO_NUTRICIONAL = "Falta cargar la información nutricional de uno o más insumos/aditivos."
    UNIDAD_NO_CONVERTIBLE = "No se puede convertir la unidad de medida a gramos/mililitros."


ID_CONFIGURACION_CALCULO = 1

PARAMETROS_NUTRIENTES_DEFAULT = (
    ("valor_energetico", "Valor energético", "kcal", Decimal("2000"), True, Decimal("4"), 1),
    ("carbohidratos", "Carbohidratos", "g", Decimal("300"), True, Decimal("0.5"), 2),
    ("azucares_totales", "Azúcares totales", "g", None, False, Decimal("0.5"), 3),
    ("azucares_anadidos", "Azúcares añadidos", "g", None, False, Decimal("0.5"), 4),
    ("proteinas", "Proteínas", "g", Decimal("75"), True, Decimal("0.5"), 5),
    ("grasas_totales", "Grasas totales", "g", Decimal("55"), True, Decimal("0.5"), 6),
    ("grasas_saturadas", "Grasas saturadas", "g", Decimal("22"), True, Decimal("0.2"), 7),
    ("grasas_trans", "Grasas trans", "g", None, False, Decimal("0.2"), 8),
    ("fibra_alimentaria", "Fibra alimentaria", "g", Decimal("25"), True, Decimal("0.5"), 9),
    ("sodio", "Sodio", "mg", Decimal("2400"), True, Decimal("5"), 10),
)