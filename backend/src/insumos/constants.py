import enum

class ErrorCode:
    INSUMO_NO_ENCONTRADO = "El insumo no fue encontrado."
    NOMBRE_DUPLICADO = "El nombre ya existe."

class UnidadMedida(str, enum.Enum):
    TONELADA = "t"
    KILOGRAMO = "kg"
    GRAMO = "g"
    MILIGRAMO = "mg"
    LITRO = "l"
    DECILITRO = "dl"
    MILILITRO = "ml"
    UNIDAD = "ud"
    DOCENA = "doc"