from dataclasses import dataclass
from enum import Enum


class EstadoRotulado(str, Enum):
    PENDIENTE = "pendiente"
    NO_CORRESPONDE = "no_corresponde"
    EXCEPTUADO = "exceptuado"
    APLICA = "aplica"


@dataclass(frozen=True)
class Marca:
    clave: str
    nombre: str
    campo_insumo: str
    campo_producto: str
    campo_regla: str


MARCAS = (
    Marca("azucares", "Azúcares agregados", "aporta_azucares", "azucares_agregados", "aplica_por_azucares"),
    Marca("grasas", "Grasas agregadas", "aporta_grasas", "grasas_agregadas", "aplica_por_grasas"),
    Marca("sodio", "Sodio agregado", "aporta_sodio", "sodio_agregado", "aplica_por_sodio"),
    Marca("edulcorantes", "Edulcorantes", "aporta_edulcorantes", "contiene_edulcorantes", "aplica_por_edulcorantes"),
    Marca("cafeina", "Cafeína", "aporta_cafeina", "contiene_cafeina", "aplica_por_cafeina"),
)

MENSAJE_PENDIENTE = "Indicá si el producto se comercializa envasado en ausencia del cliente para saber si le corresponde el rotulado frontal."
MENSAJE_APLICA = "El producto está alcanzado por el rotulado frontal porque tiene: {marcas}."

OBSERVACION_INICIAL = "Reglas iniciales de aplicabilidad del rotulado frontal."

REGLAS_INICIALES = {
    "requiere_envasado_ausencia_cliente": True,
    "aplica_por_azucares": True,
    "aplica_por_grasas": True,
    "aplica_por_sodio": True,
    "aplica_por_edulcorantes": True,
    "aplica_por_cafeina": True,
    "mensaje_no_corresponde": "El producto no se comercializa envasado en ausencia del cliente, por lo que no corresponde el rotulado frontal.",
    "mensaje_exceptuado": "El producto no tiene agregado de azúcares, grasas ni sodio y no contiene edulcorantes ni cafeína, por lo que queda exceptuado del rotulado frontal.",
}


class ErrorCode:
    REGLAS_NO_ENCONTRADAS = "La versión de las reglas de rotulado no fue encontrada."
