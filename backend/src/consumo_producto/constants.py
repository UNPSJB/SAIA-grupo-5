import enum     # TODO: Borrar cuando este implementado unidad_medida

class ErrorCode:
    CONSUMO_NO_ENCONTRADO = "El consumo no fue encontrado."
    CONSUMO_DUPLICADO = "Ya existe un consumo del insumo quimico en la tarea."
    PRODUCTO_NO_CONSUMIDO = "El producto no tiene consumos registrados"

class UnidadMedida(str, enum.Enum): # TODO: Borrar cuando este implementado unidad_medida
    TONELADA = "Tonelada"
    KILOGRAMO = "Kilogramo"
    GRAMO = "Gramo"
    MILIGRAMO = "Miligramo"
    LITRO = "Litro"
    DECILITRO = "Decilitro"
    MILILITRO = "Mililitro"
    UNIDAD = "Unidad"
    DOCENA = "Docena"