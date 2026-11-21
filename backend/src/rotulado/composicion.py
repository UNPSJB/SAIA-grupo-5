"""Composición porcentual de la receta.

Es la misma regla que aplica el frontend (``frontend/src/feature/Recetas/composicion``):
el porcentaje de cada renglón se calcula sobre la suma de las cantidades convertidas a la
unidad base de la unidad de medida estándar (masa o volumen) mayoritaria en la receta.
Los renglones con una unidad no convertible, o con otra unidad estándar, quedan excluidos
y se informan por separado.
"""
from dataclasses import dataclass, field
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.receta.models import InsumoReceta


DECIMALES_COMPOSICION = 2

MOTIVO_UNIDAD_NO_RECONOCIDA = "unidad no reconocida"
MOTIVO_OTRA_UNIDAD_MEDIDA_ESTANDAR = "unidad de medida estándar distinta al resto, no se puede sumar"


@dataclass(frozen=True)
class ItemComposicion:
    nombre: str
    tipo: str
    cantidad: float
    unidad: str
    porcentaje: float


@dataclass(frozen=True)
class RenglonExcluido:
    nombre: str
    motivo: str


@dataclass(frozen=True)
class ComposicionPorcentual:
    unidad_medida_estandar_base: str | None
    items: list[ItemComposicion] = field(default_factory=list)
    excluidos: list[RenglonExcluido] = field(default_factory=list)
    suma_porcentajes: float = 0.0


def _redondear(valor: float) -> float:
    return round(valor, DECIMALES_COMPOSICION)


def _es_convertible(unidad) -> bool:
    return unidad is not None and unidad.masa_volumen is not None and unidad.factor_a_base is not None


def calcular_composicion_porcentual(insumos: list["InsumoReceta"]) -> ComposicionPorcentual:
    unidades = [(item, item.insumo.unidad_medida) for item in insumos]

    conteo: dict[str, int] = {}
    base: str | None = None
    for _, unidad in unidades:
        if not _es_convertible(unidad):
            continue
        if base is None:
            base = unidad.masa_volumen
        conteo[unidad.masa_volumen] = conteo.get(unidad.masa_volumen, 0) + 1

    # Empate: se queda con la del primer renglón convertible (igual que el frontend).
    for masa_volumen, cantidad in conteo.items():
        if base is not None and cantidad > conteo.get(base, 0):
            base = masa_volumen

    incluidos: list[tuple["InsumoReceta", float]] = []
    excluidos: list[RenglonExcluido] = []
    for item, unidad in unidades:
        if not _es_convertible(unidad):
            excluidos.append(RenglonExcluido(nombre=item.nombre, motivo=MOTIVO_UNIDAD_NO_RECONOCIDA))
        elif unidad.masa_volumen != base:
            excluidos.append(RenglonExcluido(nombre=item.nombre, motivo=MOTIVO_OTRA_UNIDAD_MEDIDA_ESTANDAR))
        else:
            incluidos.append((item, item.cantidad * unidad.factor_a_base))

    total = sum(cantidad for _, cantidad in incluidos)
    items = [
        ItemComposicion(
            nombre=item.nombre,
            tipo=item.tipo,
            cantidad=item.cantidad,
            unidad=item.unidad_medida.nombre,
            porcentaje=_redondear((cantidad / total) * 100) if total > 0 else 0.0,
        )
        for item, cantidad in incluidos
    ]

    return ComposicionPorcentual(
        unidad_medida_estandar_base=base,
        items=items,
        excluidos=excluidos,
        suma_porcentajes=_redondear(sum(item.porcentaje for item in items)),
    )
