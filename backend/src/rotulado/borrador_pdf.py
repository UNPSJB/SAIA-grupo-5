"""Generación del borrador de rótulo en PDF.

El documento tiene dos partes:

1. el borrador del rótulo, armado con los datos cargados del producto y su receta vigente;
2. un anexo con el detalle de los cálculos: receta, composición porcentual, tabla
   nutricional con sus fuentes de datos y cálculo de sellos con la versión de parámetros
   utilizada.

En todas las páginas se registra la fecha de generación y la versión de la receta empleada.
"""
from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from io import BytesIO
from typing import TYPE_CHECKING
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    Flowable, LongTable, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

from src.receta import constants as receta_constants
from src.receta.constants import SelloFrontal
from src.rotulado.composicion import calcular_composicion_porcentual
from src.rotulado.constants import EstadoRotulado
from src.rotulado.empaquetado_pdf import dibujar_octogonos
from src.rotulado.ingredientes import texto_ingredientes

if TYPE_CHECKING:
    from src.calculo_nutricional.models import ConfiguracionCalculoNutricional, InformacionNutricionalReceta
    from src.informacion_nutricional_insumo.models import InformacionNutricionalInsumo
    from src.producto.models import Producto
    from src.receta.models import Receta
    from src.rotulado.models import ReglasRotulado, RotuladoProducto
    from src.rotulado.schemas import EvaluacionRotulado


NOMBRE_UNIDAD_ESTANDAR = {"MASA": "masa", "VOLUMEN": "volumen"}

ETIQUETA_ESTADO = {
    EstadoRotulado.PENDIENTE.value: "pendiente de datos",
    EstadoRotulado.NO_CORRESPONDE.value: "no corresponde",
    EstadoRotulado.EXCEPTUADO.value: "exceptuado",
    EstadoRotulado.APLICA.value: "alcanzado",
}
COLOR_SELLO = colors.HexColor("#C0392B")
COLOR_BORDE = colors.HexColor("#8A8A8A")
COLOR_ENCABEZADO = colors.HexColor("#EDEDED")


@dataclass
class DatosBorrador:
    producto: "Producto"
    receta: "Receta"
    evaluacion: "EvaluacionRotulado"
    info_nutricional: "InformacionNutricionalReceta"
    reglas: "ReglasRotulado"
    configuracion: "ConfiguracionCalculoNutricional"
    fuentes: dict[str, "InformacionNutricionalInsumo"] = field(default_factory=dict)
    # Datos declarados del Capítulo V del CAA (si el elaborador ya los cargó).
    caa: "RotuladoProducto | None" = None
    fecha_generacion: datetime = field(default_factory=datetime.now)


def _esc(texto: str | None) -> str:
    # Las fuentes estándar del PDF usan WinAnsi: se evitan símbolos fuera de esa codificación.
    return escape(str(texto or "").replace("≥", ">=").replace("≤", "<="))


def _numero(valor: float | Decimal | int | None, decimales: int = 2) -> str:
    if valor is None:
        return "-"
    texto = f"{float(valor):,.{decimales}f}"
    return texto.replace(",", "\x00").replace(".", ",").replace("\x00", ".")


def _valor_estado(evaluacion: "EvaluacionRotulado") -> str:
    return getattr(evaluacion.estado, "value", evaluacion.estado)


def _decimales(valor: int) -> str:
    return f"{valor} decimal" if valor == 1 else f"{valor} decimales"


def _fecha(valor: datetime | None) -> str:
    return valor.strftime("%d/%m/%Y %H:%M") if valor else "-"


def _estilos() -> dict[str, ParagraphStyle]:
    base = ParagraphStyle("normal", fontName="Helvetica", fontSize=9.5, leading=13, alignment=TA_LEFT)
    return {
        "normal": base,
        "chico": ParagraphStyle("chico", parent=base, fontSize=8, leading=11, textColor=colors.HexColor("#333333")),
        "nota": ParagraphStyle("nota", parent=base, fontSize=7.5, leading=10, textColor=colors.HexColor("#4D4D4D")),
        "titulo": ParagraphStyle("titulo", parent=base, fontName="Helvetica-Bold", fontSize=20, leading=24),
        "subtitulo": ParagraphStyle("subtitulo", parent=base, fontSize=11, leading=15, textColor=colors.HexColor("#333333")),
        "seccion": ParagraphStyle("seccion", parent=base, fontName="Helvetica-Bold", fontSize=13, leading=17),
        "subseccion": ParagraphStyle("subseccion", parent=base, fontName="Helvetica-Bold", fontSize=10, leading=14),
        "producto": ParagraphStyle("producto", parent=base, fontName="Helvetica-Bold", fontSize=16, leading=20),
        "centro": ParagraphStyle("centro", parent=base, alignment=TA_CENTER),
        "sello": ParagraphStyle(
            "sello", parent=base, alignment=TA_CENTER, fontName="Helvetica-Bold", fontSize=10, leading=12.5,
            textColor=COLOR_SELLO,
        ),
    }


def _tabla(datos: list[list], anchos: list[float], *, encabezado: bool = True,
           filas_encabezado: int = 1, estilo_extra: list | None = None) -> LongTable:
    tabla = LongTable(datos, colWidths=anchos, repeatRows=filas_encabezado if encabezado else 0)
    estilo = [
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#BFBFBF")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]
    if encabezado and filas_encabezado:
        estilo += [
            ("BACKGROUND", (0, 0), (-1, filas_encabezado - 1), COLOR_ENCABEZADO),
            ("FONTNAME", (0, 0), (-1, filas_encabezado - 1), "Helvetica-Bold"),
        ]
    if estilo_extra:
        estilo += estilo_extra
    tabla.setStyle(TableStyle(estilo))
    return tabla


def _parrafos(celdas: list, estilo: ParagraphStyle) -> list[Paragraph]:
    return [Paragraph(_esc(celda), estilo) for celda in celdas]


def _unidad_base(evaluacion_sellos, producto: "Producto") -> str:
    if evaluacion_sellos is not None:
        return "ml" if evaluacion_sellos.es_liquido else "g"
    return producto.unidad_medida.nombre


def _texto_ingredientes(receta: "Receta") -> str:
    return texto_ingredientes(receta)


def _bloque_rotulo(datos: DatosBorrador, estilos: dict[str, ParagraphStyle]) -> Table:
    producto = datos.producto
    evaluacion = datos.evaluacion
    sellos = evaluacion.sellos
    unidad = _unidad_base(sellos, producto)
    caa = datos.caa

    # Mientras el elaborador no declare un dato del Capítulo V se muestra el que ya
    # tiene el sistema (producto, receta E10 o último lote E8).
    denominacion = (caa.denominacion_venta if caa and caa.denominacion_venta else producto.nombre)
    contenido_neto = (
        caa.contenido_neto if caa and caa.contenido_neto
        else f"{_numero(producto.cantidad_neta, 0)} {_esc(producto.unidad_medida.nombre)}"
    )
    ingredientes = (
        caa.lista_ingredientes if caa and caa.lista_ingredientes
        else _texto_ingredientes(datos.receta)
    )

    contenido: list = [
        Paragraph("RÓTULO", estilos["subseccion"]),
        Paragraph(_esc(denominacion), estilos["producto"]),
    ]
    if producto.descripcion:
        contenido.append(Paragraph(_esc(producto.descripcion), estilos["chico"]))
    contenido += [
        Spacer(1, 4),
        Paragraph(f"<b>Contenido neto:</b> {_esc(contenido_neto)}", estilos["normal"]),
        Spacer(1, 4),
        Paragraph(f"<b>Ingredientes:</b> {_esc(ingredientes)}", estilos["normal"]),
        Spacer(1, 10),
        Paragraph("<b>INFORMACIÓN NUTRICIONAL</b>", estilos["normal"]),
        Spacer(1, 3),
        *_tabla_nutricional_rotulo(datos, unidad, estilos),
        Spacer(1, 3),
        Paragraph(
            "(*) Valores diarios con base en una dieta de 2000 kcal u 8400 kJ. "
            "Sus valores diarios pueden ser mayores o menores dependiendo de sus necesidades energéticas.",
            estilos["nota"],
        ),
        Spacer(1, 10),
    ]
    contenido.extend(_bloque_sellos(evaluacion, estilos))
    contenido.extend(_bloque_datos_caa(datos, estilos))

    tabla = Table([[contenido]], colWidths=[170 * mm])
    tabla.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1.2, colors.black),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return tabla


def _bloque_datos_caa(datos: DatosBorrador, estilos: dict[str, ParagraphStyle]) -> list:
    """Identificación del origen, lote, fecha de duración e instrucciones del Capítulo V."""
    caa = datos.caa
    lineas: list[tuple[str, str]] = []

    if caa:
        elaborador = " - ".join(parte for parte in (caa.razon_social, caa.domicilio) if parte)
        if elaborador:
            lineas.append(("Elaborado por", elaborador))
        if caa.numero_registro:
            lineas.append(("RNPA/RPPA", caa.numero_registro))
        if caa.identificacion_lote:
            lineas.append(("Lote", caa.identificacion_lote))
        if caa.fecha_duracion:
            lineas.append(("Consumir preferentemente antes del", caa.fecha_duracion.strftime("%d/%m/%Y")))
        if caa.instrucciones_uso:
            lineas.append(("Preparación e instrucciones de uso", caa.instrucciones_uso))
        if caa.es_importado:
            importador = " - ".join(
                parte for parte in (caa.importador_razon_social, caa.importador_domicilio) if parte
            )
            if importador:
                if caa.importador_cuit:
                    importador += f" (CUIT {caa.importador_cuit})"
                lineas.append(("Importado por", importador))

    if not lineas:
        return []

    partes: list = [Spacer(1, 8)]
    partes += [
        Paragraph(f"<b>{_esc(titulo)}:</b> {_esc(valor)}", estilos["normal"])
        for titulo, valor in lineas
    ]

    faltantes = []
    if not (caa and caa.razon_social and caa.domicilio):
        faltantes.append("razón social y domicilio del elaborador")
    if not (caa and caa.numero_registro):
        faltantes.append("número de RNPA/RPPA")
    if not (caa and caa.identificacion_lote):
        faltantes.append("identificación del lote")
    if not (caa and caa.fecha_duracion):
        faltantes.append("fecha de duración")
    if faltantes:
        partes.append(Paragraph(
            f"Datos del rótulo pendientes de declarar: {_esc(', '.join(faltantes))}. "
            "Se completan en el formulario del Capítulo V del producto.",
            estilos["nota"],
        ))
    return partes


def _tabla_nutricional_rotulo(datos: DatosBorrador, unidad: str, estilos: dict[str, ParagraphStyle]) -> list:
    info = datos.info_nutricional
    filas: list[list] = [[
        Paragraph("<b>Nutriente</b>", estilos["chico"]),
        Paragraph(f"<b>Porción: {_numero(info.porcion, 0)} {unidad}</b>", estilos["chico"]),
        Paragraph("<b>%VD (*)</b>", estilos["chico"]),
        Paragraph(f"<b>Cada 100 {unidad}</b>", estilos["chico"]),
    ]]

    for fila in info.tabla_nutricional:
        es_energia = fila.get("codigo") == "valor_energetico"
        porcion = fila.get("texto_porcion", "-")
        cada_100 = fila.get("texto_100g", "-")
        if es_energia:
            porcion = f"{porcion} kcal = {fila.get('kj_porcion')} kJ"
            cada_100 = f"{cada_100} kcal = {fila.get('kj_100g')} kJ"
        filas.append([
            Paragraph(_esc(fila.get("nombre")), estilos["chico"]),
            Paragraph(_esc(porcion), estilos["chico"]),
            Paragraph(str(fila.get("porcentaje_vd") if fila.get("porcentaje_vd") is not None else "-"), estilos["chico"]),
            Paragraph(_esc(cada_100), estilos["chico"]),
        ])

    return [_tabla(filas, [55 * mm, 48 * mm, 15 * mm, 42 * mm])]


class _SellosOctogonos(Flowable):
    """Dibuja los sellos con el mismo octógono negro que la vista previa y el PDF del empaquetado."""

    def __init__(self, sellos: list[str], ancho: float, alto: float):
        super().__init__()
        self.sellos = sellos
        self.width = ancho
        self.height = alto

    def draw(self):
        dibujar_octogonos(self.canv, self.sellos, 0, 0, self.width, self.height)


def _bloque_sellos(evaluacion: "EvaluacionRotulado", estilos: dict[str, ParagraphStyle]) -> list:
    if evaluacion.estado == EstadoRotulado.PENDIENTE.value:
        return [Paragraph("<b>Sellos de advertencia:</b> no determinados (falta informar la comercialización del producto).",
                          estilos["chico"])]
    if evaluacion.estado != EstadoRotulado.APLICA.value or evaluacion.sellos is None:
        return [Paragraph(f"<b>Sellos de advertencia:</b> no corresponde. {_esc(evaluacion.mensaje)}",
                          estilos["chico"])]

    sellos = evaluacion.sellos
    if not sellos.evaluable:
        return [Paragraph("<b>Sellos de advertencia:</b> no evaluables por falta de información nutricional de los insumos.",
                          estilos["chico"])]
    if not sellos.sellos:
        return [Paragraph("<b>Sellos de advertencia:</b> el cálculo no arroja sellos para el producto.",
                          estilos["chico"])]

    columnas = 2 if len(sellos.sellos) > 1 else 1
    filas = (len(sellos.sellos) + columnas - 1) // columnas
    ancho_sello = 34 * mm
    alto_sello = 34 * mm
    return [
        Paragraph("<b>Sellos de advertencia</b>", estilos["chico"]),
        Spacer(1, 4),
        _SellosOctogonos(sellos.sellos, ancho_sello * columnas, alto_sello * filas),
    ]


def _anexo_receta(datos: DatosBorrador, estilos: dict[str, ParagraphStyle]) -> list:
    receta = datos.receta
    filas: list[list] = [[
        Paragraph("<b>Renglón</b>", estilos["chico"]),
        Paragraph("<b>Tipo</b>", estilos["chico"]),
        Paragraph("<b>Cantidad</b>", estilos["chico"]),
        Paragraph("<b>Unidad</b>", estilos["chico"]),
        Paragraph("<b>Aditivo (clase funcional / INS)</b>", estilos["chico"]),
    ]]
    for item in receta.insumos:
        aditivo = "-"
        if item.aditivo is not None:
            aditivo = item.aditivo.clase_funcional
            if item.aditivo.numero_ins:
                aditivo += f" / {item.aditivo.numero_ins}"
        elif item.tipo == receta_constants.TipoRenglon.ADITIVO.value:
            aditivo = "Sin aditivo asociado"
        filas.append([
            Paragraph(_esc(item.insumo.nombre), estilos["chico"]),
            Paragraph(_esc(item.tipo), estilos["chico"]),
            Paragraph(_numero(item.cantidad, 3), estilos["chico"]),
            Paragraph(_esc(item.insumo.unidad_medida.nombre), estilos["chico"]),
            Paragraph(_esc(aditivo), estilos["chico"]),
        ])

    partes: list = [
        Paragraph("<b>A. Receta</b>", estilos["subseccion"]),
        Paragraph(
            f"Versión {receta.version} ({'vigente' if receta.vigente else 'no vigente'}) · "
            f"Vigente desde {_fecha(receta.fecha_desde_vigencia or receta.fecha_creacion)} · "
            f"Porción o unidad de venta: {_numero(receta.porcion, 2)} {_esc(receta.porcion_unidad_medida.nombre if receta.porcion_unidad_medida else '')}",
            estilos["chico"],
        ),
        Spacer(1, 4),
        _tabla(filas, [50 * mm, 22 * mm, 22 * mm, 18 * mm, 48 * mm]),
    ]

    if receta.etapas:
        partes += [Spacer(1, 6), Paragraph("Etapas y pasos", estilos["normal"])]
        for etapa in receta.etapas:
            pasos = " ".join(f"({paso.orden}) {paso.descripcion}" for paso in etapa.pasos)
            partes.append(Paragraph(f"<b>{etapa.orden}. {_esc(etapa.nombre)}:</b> {_esc(pasos)}", estilos["chico"]))
    return partes


def _anexo_composicion(datos: DatosBorrador, estilos: dict[str, ParagraphStyle]) -> list:
    composicion = calcular_composicion_porcentual(datos.receta.insumos)
    base = NOMBRE_UNIDAD_ESTANDAR.get(composicion.unidad_medida_estandar_base or "", "sin unidad base")
    decimales = 2

    filas: list[list] = [[
        Paragraph("<b>Renglón</b>", estilos["chico"]),
        Paragraph("<b>Tipo</b>", estilos["chico"]),
        Paragraph("<b>Cantidad</b>", estilos["chico"]),
        Paragraph("<b>Unidad</b>", estilos["chico"]),
        Paragraph("<b>Porcentaje</b>", estilos["chico"]),
    ]]
    for item in composicion.items:
        filas.append([
            Paragraph(_esc(item.nombre), estilos["chico"]),
            Paragraph(_esc(item.tipo), estilos["chico"]),
            Paragraph(_numero(item.cantidad, 3), estilos["chico"]),
            Paragraph(_esc(item.unidad), estilos["chico"]),
            Paragraph(f"{_numero(item.porcentaje, decimales)} %", estilos["chico"]),
        ])
    filas.append([
        Paragraph("<b>Total</b>", estilos["chico"]), Paragraph("", estilos["chico"]),
        Paragraph("", estilos["chico"]), Paragraph("", estilos["chico"]),
        Paragraph(f"<b>{_numero(composicion.suma_porcentajes, decimales)} %</b>", estilos["chico"]),
    ])

    partes: list = [
        Paragraph("<b>B. Composición porcentual</b>", estilos["subseccion"]),
        Paragraph(
            f"El porcentaje de cada renglón se calcula sobre la suma de las cantidades convertidas a la unidad "
            f"base de su unidad de medida estándar ({base}). Ingredientes y aditivos comparten un único 100%. "
            f"Se redondea a {decimales} decimales.",
            estilos["chico"],
        ),
        Spacer(1, 4),
        _tabla(filas, [62 * mm, 28 * mm, 24 * mm, 24 * mm, 28 * mm],
               estilo_extra=[("BACKGROUND", (0, len(filas) - 1), (-1, len(filas) - 1), COLOR_ENCABEZADO)]),
    ]

    if composicion.excluidos:
        partes += [Spacer(1, 4)]
        for excluido in composicion.excluidos:
            partes.append(Paragraph(
                f"Fuera del cálculo: <b>{_esc(excluido.nombre)}</b> ({_esc(excluido.motivo)}).", estilos["nota"]))
    return partes


def _fuente_de(datos: DatosBorrador, item) -> tuple[str, str, str]:
    info = datos.fuentes.get(f"aditivo:{item.aditivo_id}") if item.aditivo_id else None
    if info is None:
        info = datos.fuentes.get(f"insumo:{item.insumo_id}")
    if info is None:
        return "Sin información nutricional cargada", "-", "-"
    fuente = info.fuente_nutricional.nombre if info.fuente_nutricional else "-"
    return fuente, info.referencia_fuente or "-", _fecha(info.fecha_carga)


def _anexo_nutricional(datos: DatosBorrador, estilos: dict[str, ParagraphStyle]) -> list:
    info = datos.info_nutricional
    unidad = _unidad_base(datos.evaluacion.sellos, datos.producto)

    filas: list[list] = [[
        Paragraph("<b>Nutriente</b>", estilos["chico"]),
        Paragraph("<b>Por 100 g exacto</b>", estilos["chico"]),
        Paragraph("<b>Por 100 g declarado</b>", estilos["chico"]),
        Paragraph("<b>Por porción exacto</b>", estilos["chico"]),
        Paragraph("<b>Por porción declarado</b>", estilos["chico"]),
        Paragraph("<b>%VD</b>", estilos["chico"]),
    ]]
    for fila in info.tabla_nutricional:
        filas.append([
            Paragraph(_esc(fila.get("nombre")), estilos["chico"]),
            Paragraph(f"{_numero(fila.get('valor_100g_exacto'), 4)} {_esc(fila.get('unidad'))}", estilos["chico"]),
            Paragraph(_esc(fila.get("texto_100g")), estilos["chico"]),
            Paragraph(f"{_numero(fila.get('valor_porcion_exacto'), 4)} {_esc(fila.get('unidad'))}", estilos["chico"]),
            Paragraph(_esc(fila.get("texto_porcion")), estilos["chico"]),
            Paragraph(str(fila.get("porcentaje_vd") if fila.get("porcentaje_vd") is not None else "-"), estilos["chico"]),
        ])

    fuentes: list[list] = [[
        Paragraph("<b>Renglón de la receta</b>", estilos["chico"]),
        Paragraph("<b>Fuente de datos</b>", estilos["chico"]),
        Paragraph("<b>Referencia</b>", estilos["chico"]),
        Paragraph("<b>Fecha de carga</b>", estilos["chico"]),
    ]]
    for item in datos.receta.insumos:
        fuente, referencia, fecha = _fuente_de(datos, item)
        nombre = item.aditivo.nombre if item.aditivo is not None else item.insumo.nombre
        fuentes.append([
            Paragraph(_esc(nombre), estilos["chico"]),
            Paragraph(_esc(fuente), estilos["chico"]),
            Paragraph(_esc(referencia), estilos["chico"]),
            Paragraph(_esc(fecha), estilos["chico"]),
        ])

    config = datos.configuracion
    return [
        Paragraph("<b>C. Tabla nutricional y fuentes de datos</b>", estilos["subseccion"]),
        Paragraph(
            f"Calculada el {_fecha(info.fecha_calculo)} con rendimiento de {_numero(info.rendimiento, 2)} g y "
            f"porción de {_numero(info.porcion, 2)} {unidad}. Redondeo: {_decimales(config.decimales_menor_a_1)} "
            f"para valores menores a 1, {_decimales(config.decimales_entre_1_y_10)} entre 1 y 10 y "
            f"{_decimales(config.decimales_mayor_igual_10)} para valores de 10 o más; valores no significativos: "
            f"\"{_esc(config.texto_no_significativo)}\". Conversión de kcal a kJ: {_numero(config.factor_conversion_kj, 2)}.",
            estilos["chico"],
        ),
        Spacer(1, 4),
        _tabla(filas, [34 * mm, 27 * mm, 25 * mm, 27 * mm, 25 * mm, 12 * mm]),
        Spacer(1, 8),
        Paragraph("Fuentes de datos de cada renglón", estilos["normal"]),
        Spacer(1, 3),
        _tabla(fuentes, [45 * mm, 45 * mm, 55 * mm, 25 * mm]),
    ]


def _anexo_sellos(datos: DatosBorrador, estilos: dict[str, ParagraphStyle]) -> list:
    evaluacion = datos.evaluacion
    sellos = evaluacion.sellos

    marcas: list[list] = [[
        Paragraph("<b>Marca</b>", estilos["chico"]),
        Paragraph("<b>Sugerida por los ingredientes</b>", estilos["chico"]),
        Paragraph("<b>Declarada en el producto</b>", estilos["chico"]),
        Paragraph("<b>Valor usado</b>", estilos["chico"]),
        Paragraph("<b>Se considera en las reglas</b>", estilos["chico"]),
    ]]
    for marca in evaluacion.marcas:
        declarado = "Sin declarar" if marca.declarado is None else ("Sí" if marca.declarado else "No")
        marcas.append([
            Paragraph(_esc(marca.nombre), estilos["chico"]),
            Paragraph("Sí" if marca.sugerido else "No", estilos["chico"]),
            Paragraph(declarado, estilos["chico"]),
            Paragraph("Sí" if marca.valor else "No", estilos["chico"]),
            Paragraph("Sí" if marca.considerada else "No", estilos["chico"]),
        ])

    partes: list = [
        Paragraph("<b>D. Cálculo de sellos</b>", estilos["subseccion"]),
        Paragraph(
            f"Aplicabilidad del rotulado frontal: <b>{_esc(ETIQUETA_ESTADO.get(_valor_estado(evaluacion), evaluacion.estado))}</b>. "
            f"{_esc(evaluacion.mensaje)}",
            estilos["chico"],
        ),
        Spacer(1, 4),
        _tabla(marcas, [40 * mm, 38 * mm, 34 * mm, 26 * mm, 32 * mm]),
        Spacer(1, 6),
        Paragraph(
            f"Reglas de rotulado: versión {datos.reglas.version}, vigente desde "
            f"{_fecha(datos.reglas.fecha_desde_vigencia)}. {_esc(datos.reglas.observacion)}",
            estilos["chico"],
        ),
    ]

    if sellos is None:
        partes.append(Paragraph("No se evaluaron sellos porque el producto no está alcanzado por el rotulado frontal.",
                                estilos["chico"]))
        return partes

    if not sellos.evaluable:
        partes.append(Paragraph(
            "No se pudieron evaluar los sellos: falta información nutricional o peso por unidad de los insumos.",
            estilos["chico"],
        ))
        return partes

    unidad = "ml" if sellos.es_liquido else "g"
    criterios = [
        (SelloFrontal.EXCESO_AZUCARES,
         f"{_numero(sellos.azucares_anadidos)} g de azúcares añadidos cada 100 {unidad}",
         "Azúcares añadidos × 4 kcal/g >= 10 % de la energía total"),
        (SelloFrontal.EXCESO_GRASAS_TOTALES,
         f"{_numero(sellos.grasas_totales)} g de grasas totales cada 100 {unidad}",
         "Grasas totales × 9 kcal/g >= 30 % de la energía total"),
        (SelloFrontal.EXCESO_GRASAS_SATURADAS,
         f"{_numero(sellos.grasas_saturadas)} g de grasas saturadas cada 100 {unidad}",
         "Grasas saturadas × 9 kcal/g >= 10 % de la energía total"),
        (SelloFrontal.EXCESO_SODIO,
         f"{_numero(sellos.sodio)} mg de sodio cada 100 {unidad}",
         f"Sodio >= 1 mg/kcal o >= {receta_constants.LIMITE_SODIO_CADA_100} mg cada 100 {unidad}"),
    ]
    if sellos.es_liquido:
        criterios.append((SelloFrontal.EXCESO_CALORIAS,
                          f"{_numero(sellos.valor_energetico)} kcal cada 100 ml",
                          f">= {receta_constants.LIMITE_KCAL_LIQUIDOS_CADA_100} kcal cada 100 ml "
                          f"o >= {receta_constants.LIMITE_AZUCARES_LIQUIDOS_CADA_100} g de azúcares cada 100 ml"))
    else:
        criterios.append((SelloFrontal.EXCESO_CALORIAS,
                          f"{_numero(sellos.valor_energetico)} kcal cada 100 g",
                          f">= {receta_constants.LIMITE_KCAL_SOLIDOS_CADA_100} kcal cada 100 g"))

    filas: list[list] = [[
        Paragraph("<b>Sello</b>", estilos["chico"]),
        Paragraph("<b>Valor calculado</b>", estilos["chico"]),
        Paragraph("<b>Criterio aplicado</b>", estilos["chico"]),
        Paragraph("<b>Resultado</b>", estilos["chico"]),
    ]]
    for sello, valor, criterio in criterios:
        filas.append([
            Paragraph(_esc(sello), estilos["chico"]),
            Paragraph(_esc(valor), estilos["chico"]),
            Paragraph(_esc(criterio), estilos["chico"]),
            Paragraph("Sí" if sello in sellos.sellos else "No", estilos["chico"]),
        ])

    partes += [
        Spacer(1, 6),
        Paragraph(
            f"Base del cálculo: {_numero(sellos.cantidad_base)} g de insumos con información nutricional; "
            f"valores expresados cada 100 {unidad} ({'producto líquido' if sellos.es_liquido else 'producto sólido'}).",
            estilos["chico"],
        ),
        Spacer(1, 4),
        _tabla(filas, [37 * mm, 37 * mm, 75 * mm, 18 * mm]),
        Spacer(1, 4),
        Paragraph(
            f"<b>Sellos determinados:</b> {_esc(', '.join(sellos.sellos) if sellos.sellos else 'ninguno')}.",
            estilos["chico"],
        ),
    ]
    if sellos.insumos_sin_informacion:
        partes.append(Paragraph(
            f"No se tuvieron en cuenta por no tener información nutricional o peso por unidad: "
            f"{_esc(', '.join(sellos.insumos_sin_informacion))}.",
            estilos["nota"],
        ))
    return partes


def generar_pdf(datos: DatosBorrador) -> bytes:
    estilos = _estilos()
    receta = datos.receta
    fecha = _fecha(datos.fecha_generacion).replace(" ", " a las ")
    pie = (f"Borrador de rótulo · {datos.producto.nombre} · Versión {receta.version} de la receta · "
           f"Generado el {fecha}")

    def _pie_de_pagina(canvas, documento):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor("#BFBFBF"))
        canvas.setLineWidth(0.5)
        canvas.line(20 * mm, 15 * mm, A4[0] - 20 * mm, 15 * mm)
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(colors.HexColor("#4D4D4D"))
        canvas.drawString(20 * mm, 11 * mm, pie)
        canvas.drawRightString(A4[0] - 20 * mm, 11 * mm, f"Página {documento.page}")
        canvas.restoreState()

    buffer = BytesIO()
    documento = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm, bottomMargin=22 * mm,
        title=f"Borrador de rótulo - {datos.producto.nombre}",
        author="SAIA", subject=f"Borrador de rótulo, versión {receta.version} de la receta",
    )

    historia: list = [
        Paragraph("BORRADOR DE RÓTULO", estilos["titulo"]),
        Paragraph(
            f"Producto: <b>{_esc(datos.producto.nombre)}</b> · Receta versión {receta.version} · "
            f"Generado el {fecha}",
            estilos["subtitulo"],
        ),
        Spacer(1, 4),
        Paragraph(
            "Documento de trabajo con el borrador del rótulo y el detalle de los cálculos que lo sustentan, "
            "para su revisión por un profesional o para el trámite ante la autoridad sanitaria. "
            "Los datos provienen de la información cargada en el sistema para el producto y su receta vigente.",
            estilos["nota"],
        ),
        Spacer(1, 8),
        _bloque_rotulo(datos, estilos),
        PageBreak(),
        Paragraph("ANEXO · DETALLE DE LOS CÁLCULOS", estilos["titulo"]),
        Spacer(1, 4),
    ]

    metadatos = [
        ["Fecha de generación", fecha],
        ["Producto", datos.producto.nombre],
        ["Receta utilizada", f"Versión {receta.version} ({'vigente' if receta.vigente else 'no vigente'}), "
                             f"creada el {_fecha(receta.fecha_creacion)}"],
        ["Reglas de rotulado", f"Versión {datos.reglas.version}, vigente desde {_fecha(datos.reglas.fecha_desde_vigencia)}"],
        ["Información nutricional", f"Calculada el {_fecha(datos.info_nutricional.fecha_calculo)}"],
    ]
    historia.append(_tabla(
        [[Paragraph(f"<b>{_esc(clave)}</b>", estilos["chico"]), Paragraph(_esc(valor), estilos["chico"])]
         for clave, valor in metadatos],
        [45 * mm, 125 * mm], encabezado=False,
    ))
    historia.append(Spacer(1, 12))

    historia += _anexo_receta(datos, estilos)
    historia.append(Spacer(1, 12))
    historia += _anexo_composicion(datos, estilos)
    historia.append(Spacer(1, 12))
    historia += _anexo_nutricional(datos, estilos)
    historia.append(Spacer(1, 12))
    historia += _anexo_sellos(datos, estilos)

    historia += [
        Spacer(1, 14),
        Paragraph(
            "Los cálculos de esta exportación corresponden a la receta y a la versión de parámetros indicadas "
            "arriba. Si la receta o los parámetros cambian, debe generarse un nuevo borrador.",
            estilos["nota"],
        ),
    ]

    documento.build(historia, onFirstPage=_pie_de_pagina, onLaterPages=_pie_de_pagina)
    return buffer.getvalue()
