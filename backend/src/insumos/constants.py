import enum

class ErrorCode:
    INSUMO_NO_ENCONTRADO = "El insumo no fue encontrado."
    NOMBRE_DUPLICADO = "El nombre ya existe."

class UnidadMedida(str, enum.Enum):
    TONELADA = "Tonelada"
    KILOGRAMO = "Kilogramo"
    GRAMO = "Gramo"
    MILIGRAMO = "Miligramo"
    LITRO = "Litro"
    DECILITRO = "Decilitro"
    MILILITRO = "Mililitro"
    UNIDAD = "Unidad"
    DOCENA = "Docena"