"""PDF del empaquetado compuesto.

Dibuja la foto del envase y, sobre ella, los bloques del rótulo en las coordenadas
guardadas por el administrador (porcentajes del lienzo). La leyenda de borrador se
dibuja siempre, al pie, y no forma parte de los elementos movibles.
"""
import base64
from dataclasses import dataclass, field
from io import BytesIO
from typing import TYPE_CHECKING

from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfgen import canvas

if TYPE_CHECKING:
    from src.rotulado.schemas import DatosRotuladoCAA, ElementoEmpaquetado


ANCHO_PAGINA = 210 * mm
RELACION_MINIMA = 0.45
RELACION_MAXIMA = 2.2
COLOR_SELLO = colors.HexColor("#C0392B")
COLOR_BORDE = colors.HexColor("#9A9A9A")
BLANCO = colors.white

PREFIJO = {
    "contenido_neto": "Contenido neto: ",
    "ingredientes": "Ingredientes: ",
    "instrucciones": "Preparación e instrucciones de uso: ",
}


@dataclass
class DatosEmpaquetado:
    producto_nombre: str
    datos: "DatosRotuladoCAA"
    elementos: list["ElementoEmpaquetado"] = field(default_factory=list)
    foto: str | None = None
    tabla_nutricional: list[dict] | None = None
    sellos: list[str] = field(default_factory=list)
    mensaje_sellos: str = ""
    unidad: str = "g"
    porcion: float | None = None
    leyenda: str = ""
    faltantes: list[str] = field(default_factory=list)


def _imagen(foto: str | None) -> ImageReader | None:
    if not foto or "," not in foto:
        return None
    try:
        crudo = base64.b64decode(foto.split(",", 1)[1])
        return ImageReader(BytesIO(crudo))
    except Exception:
        return None


def _relacion(imagen: ImageReader | None) -> float:
    if imagen is None:
        return 1.25
    ancho, alto = imagen.getSize()
    if not ancho:
        return 1.25
    return min(max(alto / ancho, RELACION_MINIMA), RELACION_MAXIMA)


def _dibujar_fondo(c, imagen: ImageReader | None, ancho: float, alto: float) -> None:
    c.setFillColor(BLANCO)
    c.rect(0, 0, ancho, alto, fill=1, stroke=0)
    if imagen is None:
        # Sin foto se muestra el lienzo del rótulo, con un borde tenue.
        c.setStrokeColor(COLOR_BORDE)
        c.setDash(3, 3)
        c.rect(2 * mm, 2 * mm, ancho - 4 * mm, alto - 4 * mm, fill=0, stroke=1)
        c.setDash()
        return

    ancho_img, alto_img = imagen.getSize()
    escala = min(ancho / ancho_img, alto / alto_img)
    dibujo_ancho, dibujo_alto = ancho_img * escala, alto_img * escala
    c.drawImage(
        imagen,
        (ancho - dibujo_ancho) / 2,
        (alto - dibujo_alto) / 2,
        dibujo_ancho,
        dibujo_alto,
        preserveAspectRatio=True,
        mask="auto",
    )


def _lineas_de(elemento: "ElementoEmpaquetado", datos: DatosEmpaquetado) -> list[str]:
    caa = datos.datos
    clave = elemento.clave

    if clave == "denominacion":
        return [caa.denominacion_venta or datos.producto_nombre]
    if clave in PREFIJO:
        valor = {
            "contenido_neto": caa.contenido_neto,
            "ingredientes": caa.lista_ingredientes,
            "instrucciones": caa.instrucciones_uso,
        }[clave]
        return [f"{PREFIJO[clave]}{valor}"] if valor else []
    if clave == "origen":
        lineas = []
        elaborador = " - ".join(parte for parte in (caa.razon_social, caa.domicilio) if parte)
        if elaborador:
            lineas.append(f"Elaborado por: {elaborador}")
        if caa.numero_registro:
            lineas.append(f"RNPA/RPPA: {caa.numero_registro}")
        return lineas
    if clave == "lote_fecha":
        lineas = []
        if caa.identificacion_lote:
            lineas.append(f"Lote: {caa.identificacion_lote}")
        if caa.fecha_duracion:
            lineas.append(
                "Consumir preferentemente antes del: "
                f"{caa.fecha_duracion.strftime('%d/%m/%Y')}"
            )
        return lineas
    if clave == "importador":
        if not caa.es_importado:
            return []
        lineas = []
        importador = " - ".join(
            parte for parte in (caa.importador_razon_social, caa.importador_domicilio) if parte
        )
        if importador:
            if caa.importador_cuit:
                importador += f" (CUIT {caa.importador_cuit})"
            lineas.append(f"Importado por: {importador}")
        return lineas
    return []


def _caja(c, x: float, y: float, ancho: float, alto: float) -> None:
    c.setFillColor(colors.Color(1, 1, 1, alpha=0.9))
    c.setStrokeColor(colors.Color(0, 0, 0, alpha=0.18))
    c.setLineWidth(0.4)
    c.roundRect(x, y, ancho, alto, 1.2 * mm, fill=1, stroke=1)


def _texto_ajustado(
    c,
    lineas: list[str],
    x: float,
    y: float,
    ancho: float,
    alto: float,
    tamano_max: float = 9,
    negrita: bool = False,
) -> None:
    if not lineas:
        return
    fuente = "Helvetica-Bold" if negrita else "Helvetica"
    relleno = 1.5 * mm
    disponible = max(ancho - 2 * relleno, 1)
    tamano = min(tamano_max, max(alto * 0.42, 3.2))

    envueltas: list[str] = []
    while tamano >= 3.2:
        envueltas = []
        for linea in lineas:
            envueltas.extend(simpleSplit(linea, fuente, tamano, disponible))
        if len(envueltas) * tamano * 1.25 <= alto - 2 * relleno:
            break
        tamano -= 0.4

    c.setFillColor(colors.black)
    c.setFont(fuente, tamano)
    y_texto = y + alto - relleno - tamano
    for linea in envueltas:
        c.drawString(x + relleno, y_texto, linea)
        y_texto -= tamano * 1.25


def _dibujar_tabla_nutricional(c, datos: DatosEmpaquetado, x: float, y: float,
                               ancho: float, alto: float) -> None:
    from reportlab.platypus import Table, TableStyle

    filas: list[list[str]] = [[
        "Nutriente",
        f"Porción: {datos.porcion:g} {datos.unidad}" if datos.porcion else "Por porción",
        "%VD (*)",
        f"Cada 100 {datos.unidad}",
    ]]
    for fila in datos.tabla_nutricional or []:
        porcion = fila.get("texto_porcion", "-")
        cada_100 = fila.get("texto_100g", "-")
        if fila.get("codigo") == "valor_energetico":
            porcion = f"{porcion} kcal = {fila.get('kj_porcion')} kJ"
            cada_100 = f"{cada_100} kcal = {fila.get('kj_100g')} kJ"
        filas.append([
            str(fila.get("nombre") or ""),
            str(porcion),
            str(fila.get("porcentaje_vd") if fila.get("porcentaje_vd") is not None else "-"),
            str(cada_100),
        ])
    if len(filas) == 1:
        filas.append(["", "Sin información nutricional calculada", "", ""])

    anchos = [ancho * 0.38, ancho * 0.3, ancho * 0.12, ancho * 0.2]
    altura_maxima = alto - 1.5 * mm
    for tamano in (6.0, 5.6, 5.2, 4.8, 4.4, 4.0, 3.6):
        tabla = Table(filas, colWidths=anchos)
        tabla.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#8C8C8C")),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EDEDED")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), tamano),
            ("LEFTPADDING", (0, 0), (-1, -1), 1.6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 1.6),
            ("TOPPADDING", (0, 0), (-1, -1), 0.8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0.8),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        _, altura_tabla = tabla.wrapOn(c, ancho, alto)
        if altura_tabla <= altura_maxima:
            break
    tabla.drawOn(c, x + 0.8 * mm, y + alto - altura_tabla - 0.8 * mm)


FRACCION_CORTE_OCTOGONO = 0.29
PREFIJO_SELLO = "EXCESO EN "


def _ruta_octogono(c, x: float, y: float, lado: float):
    """Octógono con los mismos cortes que el sello de la vista previa (29 %)."""
    corte = lado * FRACCION_CORTE_OCTOGONO
    puntos = (
        (x + corte, y),
        (x + lado - corte, y),
        (x + lado, y + corte),
        (x + lado, y + lado - corte),
        (x + lado - corte, y + lado),
        (x + corte, y + lado),
        (x, y + lado - corte),
        (x, y + corte),
    )
    ruta = c.beginPath()
    ruta.moveTo(*puntos[0])
    for punto in puntos[1:]:
        ruta.lineTo(*punto)
    ruta.close()
    return ruta


def _dibujar_octogono(c, x: float, y: float, lado: float, sello: str) -> None:
    """Sello octogonal negro con anillo blanco y el texto en blanco, como en la UI."""
    c.setFillColor(colors.black)
    c.drawPath(_ruta_octogono(c, x, y, lado), fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.drawPath(
        _ruta_octogono(c, x + lado * 0.032, y + lado * 0.032, lado * 0.936),
        fill=1, stroke=0,
    )
    c.setFillColor(colors.black)
    c.drawPath(
        _ruta_octogono(c, x + lado * 0.054, y + lado * 0.054, lado * 0.892),
        fill=1, stroke=0,
    )

    centro_x = x + lado / 2
    centro_y = y + lado / 2
    es_exceso = sello.startswith(PREFIJO_SELLO)
    prefijo = "EXCESO EN" if es_exceso else ""
    texto = sello[len(PREFIJO_SELLO):] if es_exceso else sello

    disponible = lado * 0.62
    tamano_nutriente = lado * 0.115
    lineas: list[str] = []
    while True:
        lineas = simpleSplit(texto, "Helvetica-Bold", tamano_nutriente, disponible)
        if len(lineas) <= 2 or tamano_nutriente <= lado * 0.055:
            break
        tamano_nutriente -= lado * 0.008

    tamano_prefijo = lado * 0.082
    alto_total = (tamano_prefijo * 1.15 if prefijo else 0) + len(lineas) * tamano_nutriente * 1.15
    cursor = centro_y + alto_total / 2

    c.setFillColor(colors.white)
    if prefijo:
        c.setFont("Helvetica-Bold", tamano_prefijo)
        c.drawCentredString(centro_x, cursor - tamano_prefijo, prefijo)
        cursor -= tamano_prefijo * 1.15
    c.setFont("Helvetica-Bold", tamano_nutriente)
    for linea in lineas:
        c.drawCentredString(centro_x, cursor - tamano_nutriente, linea)
        cursor -= tamano_nutriente * 1.15


def dibujar_octogonos(c, sellos: list[str], x: float, y: float, ancho: float, alto: float) -> None:
    """Reparte los sellos en una grilla de dos columnas dentro del rectángulo indicado."""
    if not sellos:
        return

    columnas = 2 if len(sellos) > 1 else 1
    filas = (len(sellos) + columnas - 1) // columnas
    relleno = 0.8 * mm
    celda_ancho = (ancho - relleno * (columnas + 1)) / columnas
    celda_alto = (alto - relleno * (filas + 1)) / filas
    lado = max(7 * mm, min(celda_ancho, celda_alto) * 0.98)

    for indice, sello in enumerate(sellos):
        fila, columna = divmod(indice, columnas)
        cx = x + relleno + columna * (celda_ancho + relleno)
        cy = y + alto - relleno - (fila + 1) * celda_alto - fila * relleno
        _dibujar_octogono(
            c,
            cx + (celda_ancho - lado) / 2,
            cy + (celda_alto - lado) / 2,
            lado,
            sello,
        )


def _dibujar_sellos(c, datos: DatosEmpaquetado, x: float, y: float,
                    ancho: float, alto: float) -> None:
    if not datos.sellos:
        _texto_ajustado(
            c,
            [f"Sellos de advertencia: {datos.mensaje_sellos}" if datos.mensaje_sellos
             else "Sellos de advertencia: no corresponde."],
            x, y, ancho, alto,
        )
        return
    dibujar_octogonos(c, datos.sellos, x, y, ancho, alto)


def _dibujar_leyenda(c, leyenda: str, ancho: float) -> None:
    alto_leyenda = 12 * mm
    c.setFillColor(BLANCO)
    c.rect(0, 0, ancho, alto_leyenda, fill=1, stroke=0)
    c.setStrokeColor(COLOR_SELLO)
    c.setLineWidth(1)
    c.rect(3 * mm, 2.2 * mm, ancho - 6 * mm, alto_leyenda - 4.4 * mm, fill=0, stroke=1)

    for tamano in (7.4, 7.0, 6.6, 6.2, 5.8, 5.4):
        lineas = simpleSplit(leyenda, "Helvetica-Bold", tamano, ancho - 10 * mm)
        if len(lineas) * tamano * 1.2 <= alto_leyenda - 5 * mm:
            break
    c.setFillColor(COLOR_SELLO)
    c.setFont("Helvetica-Bold", tamano)
    alto_texto = len(lineas) * tamano * 1.2
    y_texto = (alto_leyenda + alto_texto) / 2 - tamano
    for linea in lineas:
        c.drawCentredString(ancho / 2, y_texto, linea)
        y_texto -= tamano * 1.2


def generar_pdf_empaquetado(datos: DatosEmpaquetado) -> bytes:
    imagen = _imagen(datos.foto)
    alto_pagina = ANCHO_PAGINA * _relacion(imagen)

    buffer = BytesIO()
    documento = canvas.Canvas(buffer, pagesize=(ANCHO_PAGINA, alto_pagina))
    documento.setTitle(f"Empaquetado - {datos.producto_nombre}")
    documento.setAuthor("SAIA")
    documento.setSubject("Vista previa del empaquetado (borrador)")

    _dibujar_fondo(documento, imagen, ANCHO_PAGINA, alto_pagina)
    # La leyenda ocupa el pie: los elementos no pueden taparla.
    alto_util = alto_pagina - 12 * mm

    for elemento in datos.elementos:
        if not elemento.visible:
            continue
        ancho = ANCHO_PAGINA * elemento.ancho / 100
        alto = alto_util * elemento.alto / 100
        x = ANCHO_PAGINA * elemento.x / 100
        y = alto_util - alto_util * (elemento.y + elemento.alto) / 100

        if elemento.clave == "tabla_nutricional":
            documento.setFillColor(colors.Color(1, 1, 1, alpha=0.92))
            documento.setStrokeColor(colors.Color(0, 0, 0, alpha=0.18))
            documento.roundRect(x, y, ancho, alto, 1.2 * mm, fill=1, stroke=1)
            _dibujar_tabla_nutricional(documento, datos, x, y, ancho, alto)
            continue
        if elemento.clave == "sellos":
            _dibujar_sellos(documento, datos, x, y, ancho, alto)
            continue

        lineas = _lineas_de(elemento, datos)
        if not lineas:
            continue
        _caja(documento, x, y, ancho, alto)
        _texto_ajustado(
            documento, lineas, x, y, ancho, alto,
            tamano_max=13 if elemento.clave == "denominacion" else 9,
            negrita=elemento.clave == "denominacion",
        )

    _dibujar_leyenda(documento, datos.leyenda, ANCHO_PAGINA)
    documento.showPage()
    documento.save()
    return buffer.getvalue()
