"""Lista de ingredientes del rótulo (E10) a partir de la receta vigente.

Se usa tanto en el borrador en PDF como en el formulario del Capítulo V del CAA,
para que ambos muestren exactamente el mismo texto.
"""
from dataclasses import dataclass, field
from typing import TYPE_CHECKING

from src.rotulado.composicion import calcular_composicion_porcentual
from src.receta.constants import TipoRenglon
from src.rotulado.constants import FormatoDeclaracionAditivos, PREFIJO_AROMATIZANTE

if TYPE_CHECKING:
    from src.receta.models import Receta
    from src.aditivo.models import Aditivo
    from src.insumos.models import Insumo


@dataclass(frozen=True)
class IngredienteRotulo:
    insumo_id: int
    texto: str
    porcentaje: float | None
    empata: bool = False


@dataclass(frozen=True)
class AditivoRotulo:
    funcion: str | None
    texto: str
    aditivos: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class ListaIngredientes:
    ingredientes: list[IngredienteRotulo]
    aditivos: list[AditivoRotulo]
    texto: str
    orden_manual: bool
    formato: str


def _denominacion(insumo: "Insumo") -> str:
    return (insumo.denominacion_rotulo or "").strip() or insumo.nombre


def _es_aromatizante(funcion: str) -> bool:
    return funcion.strip().casefold().startswith(PREFIJO_AROMATIZANTE)


def _declaracion_aditivo(aditivo: "Aditivo", formato: str) -> str:
    ins = f"INS {aditivo.numero_ins}" if aditivo.numero_ins else None
    if formato == FormatoDeclaracionAditivos.INS.value:
        return ins or aditivo.nombre
    if formato == FormatoDeclaracionAditivos.NOMBRE.value:
        return aditivo.nombre
    return f"{aditivo.nombre} ({ins})" if ins else aditivo.nombre


def _ordenar_ingredientes(receta: "Receta", orden_manual: list[int] | None) -> list[IngredienteRotulo]:
    porcentajes = {item.insumo_id: item.porcentaje
                   for item in calcular_composicion_porcentual(receta.insumos).items}
    posicion = {insumo_id: n for n, insumo_id in enumerate(orden_manual or [])}
    sin_manual = len(posicion)

    renglones = [(n, item) for n, item in enumerate(receta.insumos)
                 if item.tipo == TipoRenglon.INGREDIENTE.value]

    def clave(par):
        n, item = par
        pct = porcentajes.get(item.insumo_id)
        return (pct is None, -(pct or 0.0), posicion.get(item.insumo_id, sin_manual), n)

    renglones.sort(key=clave)

    repeticiones: dict[float, int] = {}
    for _, item in renglones:
        pct = porcentajes.get(item.insumo_id)
        if pct is not None:
            repeticiones[pct] = repeticiones.get(pct, 0) + 1

    return [
        IngredienteRotulo(
            insumo_id=item.insumo_id,
            texto=_denominacion(item.insumo),
            porcentaje=porcentajes.get(item.insumo_id),
            empata=repeticiones.get(porcentajes.get(item.insumo_id), 0) > 1,
        )
        for _, item in renglones
    ]


def _agrupar_aditivos(receta: "Receta", formato: str) -> list[AditivoRotulo]:
    grupos: dict[str, list[str]] = {}
    sin_clasificar: list[AditivoRotulo] = []
    for item in receta.insumos:
        if item.tipo != TipoRenglon.ADITIVO.value:
            continue
        if item.aditivo is None:
            sin_clasificar.append(AditivoRotulo(None, _denominacion(item.insumo)))
            continue
        funcion = item.aditivo.clase_funcional.strip()
        declarados = grupos.setdefault(funcion, [])
        if not _es_aromatizante(funcion):
            declarados.append(_declaracion_aditivo(item.aditivo, formato))

    resultado = []
    for funcion in sorted(grupos, key=str.casefold):
        declarados = grupos[funcion]
        texto = funcion if not declarados else f"{funcion}: {', '.join(declarados)}"
        resultado.append(AditivoRotulo(funcion, texto, declarados))
    return resultado + sin_clasificar


def armar_lista(
    receta: "Receta",
    formato: str = FormatoDeclaracionAditivos.NOMBRE_E_INS.value,
    orden_manual: list[int] | None = None,
) -> ListaIngredientes:
    ingredientes = _ordenar_ingredientes(receta, orden_manual)
    automatico = _ordenar_ingredientes(receta, None)
    aditivos = _agrupar_aditivos(receta, formato)
    return ListaIngredientes(
        ingredientes=ingredientes,
        aditivos=aditivos,
        texto=", ".join([i.texto for i in ingredientes] + [a.texto for a in aditivos]),
        orden_manual=[i.insumo_id for i in ingredientes] != [i.insumo_id for i in automatico],
        formato=formato,
    )


def texto_ingredientes(receta: "Receta", formato: str = FormatoDeclaracionAditivos.NOMBRE_E_INS.value,
                       orden_manual: list[int] | None = None) -> str:
    return armar_lista(receta, formato, orden_manual).texto