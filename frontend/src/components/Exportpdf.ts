import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import type { ExportColumn } from './Exportcsv';
import { mostrarAlertaError } from '../libs/alertas';
import {finalizarPaginasPdf, INICIO_CONTENIDO_PDF, MARGEN_INFERIOR_PDF, MARGEN_PDF, obtenerDatosPymePdf,} from './CabeceraPdf';

interface TablePdfOptions<T> {
    title: string;
    filename: string;
    columns: ExportColumn<T>[];
    rows: T[];
    orientation?: 'portrait' | 'landscape';
}

export async function exportTableToPdf<T>({
    title,
    filename,
    columns,
    rows,
    orientation = 'portrait',
}: TablePdfOptions<T>) {
    try {
        const datosPyme = await obtenerDatosPymePdf();
        const doc = new jsPDF({ orientation });

        const mostrarCabecera = datosPyme !== null;
        const inicioTitulo = mostrarCabecera ? INICIO_CONTENIDO_PDF + 5 : 16;
        const inicioTabla = mostrarCabecera ? INICIO_CONTENIDO_PDF + 16 : 27;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text(title, MARGEN_PDF, inicioTitulo);

        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(`${rows.length} registros`, MARGEN_PDF, inicioTitulo + 6);

        autoTable(doc, {
            startY: inicioTabla,
            margin: {
                top: mostrarCabecera ? INICIO_CONTENIDO_PDF : 14,
                bottom: MARGEN_INFERIOR_PDF,
                left: MARGEN_PDF,
                right: MARGEN_PDF,
            },
            head: [columns.map(c => c.header)],
            body: rows.map(r => columns.map(c => String(c.value(r) ?? ''))),
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [33, 37, 41] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
        });

        finalizarPaginasPdf(doc, datosPyme);
        doc.save(`${filename}.pdf`);
    } catch (error) {
        console.error(error);
        mostrarAlertaError('No se pudo generar el PDF.');
    }
}
