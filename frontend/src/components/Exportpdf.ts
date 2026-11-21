import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import type { ExportColumn } from './Exportcsv';

const fechaHoy = () => new Date().toLocaleDateString('es-AR');

function addFooter(doc: jsPDF) {
    const total = doc.getNumberOfPages();
    const { width, height } = doc.internal.pageSize;
    doc.setFontSize(8);
    doc.setTextColor(120);
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.text(`Generado el ${fechaHoy()}`, 14, height - 8);
        doc.text(`Página ${i} de ${total}`, width - 14, height - 8, { align: 'right' });
    }
}

interface TablePdfOptions<T> {
    title: string;
    filename: string;
    columns: ExportColumn<T>[];
    rows: T[];
    orientation?: 'portrait' | 'landscape';
}

export function exportTableToPdf<T>({
    title,
    filename,
    columns,
    rows,
    orientation = 'portrait',
}: TablePdfOptions<T>) {
    const doc = new jsPDF({ orientation });
    doc.setFontSize(16);
    doc.text(title, 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`${rows.length} registros`, 14, 22);

    autoTable(doc, {
        startY: 27,
        head: [columns.map(c => c.header)],
        body: rows.map(r => columns.map(c => String(c.value(r) ?? ''))),
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [33, 37, 41] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    addFooter(doc);
    doc.save(`${filename}.pdf`);
}
