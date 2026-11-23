"""PDF de la tabla de información nutricional con su leyenda."""
from datetime import datetime
from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.utils import simpleSplit
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from src.calculo_nutricional.schemas import TablaNutricionalRotulo

GRIS = colors.HexColor("#EDEDED")


def _p(texto, estilo):
    return Paragraph(escape(str(texto)), estilo)


def _numero(valor) -> str:
    return f"{float(valor):g}".replace(".", ",")


def generar_pdf_tabla(tabla: TablaNutricionalRotulo) -> bytes:
    base = ParagraphStyle("base", fontName="Helvetica", fontSize=9.5, leading=13)
    chico = ParagraphStyle("chico", parent=base, fontSize=8.5, leading=11)
    titulo = ParagraphStyle("titulo", parent=base, fontName="Helvetica-Bold", fontSize=16, leading=20)
    leyenda = ParagraphStyle("leyenda", parent=base, fontName="Helvetica-Bold", fontSize=9, leading=12)

    unidad = tabla.unidad
    porcion = f"{_numero(tabla.porcion)} {unidad}"
    if tabla.medida_casera:
        porcion += f" ({tabla.medida_casera})"

    filas = [[
        _p("Nutriente", chico),
        _p(f"Cada 100 {unidad}", chico),
        _p(f"Por porción ({porcion})", chico),
        _p("%VD (*)", chico),
    ]]
    for fila in tabla.tabla_nutricional:
        por_100, por_porcion = fila.texto_100g, fila.texto_porcion
        if fila.codigo == "valor_energetico":
            por_100 = f"{por_100} kcal = {fila.kj_100g} kJ"
            por_porcion = f"{por_porcion} kcal = {fila.kj_porcion} kJ"
        else:
            por_100 = f"{por_100} {fila.unidad}"
            por_porcion = f"{por_porcion} {fila.unidad}"
        filas.append([
            _p(fila.nombre, chico), _p(por_100, chico), _p(por_porcion, chico),
            _p("-" if fila.porcentaje_vd is None else fila.porcentaje_vd, chico),
        ])

    t = Table(filas, colWidths=[55 * mm, 42 * mm, 48 * mm, 25 * mm], repeatRows=1)
    t.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#BFBFBF")),
        ("BACKGROUND", (0, 0), (-1, 0), GRIS),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))

    caja = Table([[Paragraph(escape(tabla.leyenda), leyenda)]], colWidths=[170 * mm])
    caja.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1, colors.black),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFF4D6")),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))

    pie = f"{tabla.leyenda}  Generado el {datetime.now():%d/%m/%Y %H:%M}."

    def _pie(canvas, documento):
        canvas.saveState()
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(colors.HexColor("#4D4D4D"))
        y = 14 * mm
        for linea in simpleSplit(pie, "Helvetica", 7.5, A4[0] - 40 * mm):
            canvas.drawString(20 * mm, y, linea)
            y -= 9
        canvas.drawRightString(A4[0] - 20 * mm, 8 * mm, f"Página {documento.page}")
        canvas.restoreState()

    buffer = BytesIO()
    documento = SimpleDocTemplate(
        buffer, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=18 * mm, bottomMargin=26 * mm,
        title=f"Información nutricional - {tabla.producto}", author="SAIA",
    )
    documento.build([
        _p("INFORMACIÓN NUTRICIONAL", titulo),
        _p(f"Producto: {tabla.producto} · Receta versión {tabla.receta_version} · "
           f"Calculada el {tabla.fecha_calculo:%d/%m/%Y %H:%M}", chico),
        Spacer(1, 6),
        caja,
        Spacer(1, 8),
        _p(f"Porción declarada: {porcion}", base),
        Spacer(1, 4),
        t,
        Spacer(1, 4),
        _p("(*) Valores diarios con base en una dieta de 2000 kcal u 8400 kJ. Sus valores diarios pueden "
           "ser mayores o menores dependiendo de sus necesidades energéticas.", chico),
    ], onFirstPage=_pie, onLaterPages=_pie)
    return buffer.getvalue()