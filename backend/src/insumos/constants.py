import enum

class ErrorCode:
    INSUMO_NO_ENCONTRADO = "El insumo no fue encontrado."
    INSUMO_DUPLICADO = "Ya existe un insumo con ese nombre y unidad de medida."

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