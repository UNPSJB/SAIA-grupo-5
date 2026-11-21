"""Lista de ingredientes del rótulo (E10) a partir de la receta vigente.

Se usa tanto en el borrador en PDF como en el formulario del Capítulo V del CAA,
para que ambos muestren exactamente el mismo texto.
"""
from typing import TYPE_CHECKING

from src.receta import constants as receta_constants
from src.receta.sellos import gramos_de_insumo

if TYPE_CHECKING:
    from src.receta.models import Receta


def texto_ingredientes(receta: "Receta") -> str:
    """Ingredientes en orden decreciente de peso inicial, con los aditivos al final."""
    ingredientes = [
        (item, gramos_de_insumo(item.insumo, item.cantidad))
        for item in receta.insumos
        if item.tipo == receta_constants.TipoRenglon.INGREDIENTE.value
    ]
    ingredientes.sort(key=lambda par: (par[1] is None, -(par[1] or 0)))

    aditivos = [
        item for item in receta.insumos
        if item.tipo == receta_constants.TipoRenglon.ADITIVO.value
    ]

    partes = [item.insumo.nombre for item, _ in ingredientes]
    for item in aditivos:
        if item.aditivo is None:
            partes.append(item.insumo.nombre)
            continue
        detalle = f"{item.aditivo.clase_funcional}: {item.aditivo.nombre}"
        if item.aditivo.numero_ins:
            detalle += f" (INS {item.aditivo.numero_ins})"
        partes.append(detalle)
    return ", ".join(partes)
