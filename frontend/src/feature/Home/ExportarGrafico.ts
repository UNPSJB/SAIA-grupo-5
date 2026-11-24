import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import {
    finalizarPaginasPdf,
    INICIO_CONTENIDO_PDF,
    obtenerDatosPymePdf,
} from "../../components/CabeceraPdf";

function sanitizarNombreArchivo(nombre: string): string {
    return nombre
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w-]+/g, "_")
        .toLowerCase();
}

function cargarImagen(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("No se pudo cargar la imagen del gráfico."));
        img.src = src;
    });
}

async function capturarContenedorPng(contenedor: HTMLElement): Promise<HTMLImageElement> {
    const altoExtra = 20;
    const dataUrl = await toPng(contenedor, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        height: contenedor.scrollHeight + altoExtra,
        style: {
            paddingBottom: `${altoExtra}px`,
            overflow: "visible",
        },
        filter: (node) => {
            return !(node instanceof HTMLElement && node.dataset?.noExport === "true");
        },
    });
    return await cargarImagen(dataUrl);
}

export interface ExportarGraficoOpciones {
    contenedor: HTMLElement;
    titulo: string;
    subtitulo?: string;
    periodo?: string;
}

export async function exportarGraficoImagen({ contenedor, titulo, subtitulo, periodo }: ExportarGraficoOpciones): Promise<void> {
    const imgGrafico = await capturarContenedorPng(contenedor);
    const escala = 2;
    const anchoGrafico = imgGrafico.width / escala;
    const altoGrafico = imgGrafico.height / escala;
    const padding = 20;
    const altoEncabezado = 54;

    const canvas = document.createElement("canvas");
    canvas.width = (anchoGrafico + padding * 2) * escala;
    canvas.height = (altoGrafico + altoEncabezado + padding * 2) * escala;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo inicializar el lienzo.");

    ctx.scale(escala, escala);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, anchoGrafico + padding * 2, altoGrafico + altoEncabezado + padding * 2);

    ctx.fillStyle = "#1a202c";
    ctx.font = "bold 16px Helvetica, Arial, sans-serif";
    ctx.fillText(titulo, padding, padding + 16);

    const bajada = [subtitulo, periodo ? `Período: ${periodo}` : undefined].filter(Boolean).join(" · ");
    ctx.fillStyle = "#718096";
    ctx.font = "12px Helvetica, Arial, sans-serif";
    ctx.fillText(bajada, padding, padding + 35);
    ctx.drawImage(imgGrafico, padding, padding + altoEncabezado, anchoGrafico, altoGrafico);

    const link = document.createElement("a");
    link.download = `grafico_${sanitizarNombreArchivo(titulo)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
}

export async function exportarGraficoPdf({ contenedor, titulo, subtitulo, periodo }: ExportarGraficoOpciones): Promise<void> {
    const imgGrafico = await capturarContenedorPng(contenedor);
    const datosPyme = await obtenerDatosPymePdf();

    const doc = new jsPDF({ orientation: "landscape" });
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const inicioTitulo = datosPyme ? INICIO_CONTENIDO_PDF + 5 : 18;
    const inicioGrafico = datosPyme ? INICIO_CONTENIDO_PDF + 17 : 30;

    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - inicioGrafico - 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(titulo, margin, inicioTitulo);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90);

    const bajada = [subtitulo, periodo ? `Período: ${periodo}` : undefined].filter(Boolean).join(" · ");
    doc.text(bajada, margin, inicioTitulo + 7);

    const ratio = Math.min(maxWidth / imgGrafico.width, maxHeight / imgGrafico.height);
    const imgWidth = imgGrafico.width * ratio;
    const imgHeight = imgGrafico.height * ratio;

    doc.addImage(imgGrafico.src, "PNG", margin, inicioGrafico, imgWidth, imgHeight);

    if (datosPyme) {
        finalizarPaginasPdf(doc, datosPyme);
    }

    doc.save(`grafico_${sanitizarNombreArchivo(titulo)}.pdf`);
}
