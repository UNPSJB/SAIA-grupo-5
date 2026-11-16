from enum import Enum


class ErrorCode:
    UNIDAD_NO_ENCONTRADA = "La unidad de medida no fue encontrada."
    UNIDAD_DUPLICADA = "Ya existe una unidad de medida con ese nombre."
    UNIDAD_DADA_DE_BAJA = "La unidad de medidad esta dada de baja."
    UNIDAD_MEDIDA_UTILIZADA = "No se puede dar de baja la unidad de medida ya que esta siendo utilizada por un insumo, un consumo o un producto activo."


class MasaVolumen(str, Enum):
    MASA = "MASA"
    VOLUMEN = "VOLUMEN"

UNIDADES_ESTANDAR = (
    ("mg", "Miligramo", MasaVolumen.MASA, 0.001),
    ("g", "Gramo", MasaVolumen.MASA, 1.0),
    ("kg", "Kilogramo", MasaVolumen.MASA, 1000.0),
    ("ml", "Mililitro", MasaVolumen.VOLUMEN, 1.0),
    ("l", "Litro", MasaVolumen.VOLUMEN, 1000.0),
)
