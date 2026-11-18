class ErrorCode:
    INFO_NUTRICIONAL_NO_ENCONTRADA ="La informacion nutricional no existe."
    INFO_NUTRICIONAL_DUPLICADA = "Ya existe una informacion nutricional para ese insumo."
    AZUCAR_ANADIDO_INCORRECTA = "Los azúcares añadidos no pueden superar a los azúcares totales."
    AZUCAR_TOTAL_INCORRECTA = "Los azúcares totales no pueden superar a los carbohidratos."
    GRASA_TOTAL_INCORRECTA = "La suma de grasas saturadas y trans no puede superar a las grasas totales."
    ASOCIACION_INCORRECTA = "Debe estar asociado un insumo o un aditivo, no ambos a la vez."
    DATOS_OBLIGATORIOS_FALTANTES = "Para un insumo todos los nutrientes son obligatorios"

DATOS_NUTRICIONALES = (
    "valor_energetico",
    "carbohidratos",
    "azucares_totales",
    "azucares_anadidos",
    "proteinas",
    "grasas_totales",
    "grasas_saturadas",
    "grasas_trans",
    "fibra_alimentaria",
    "sodio",
)
