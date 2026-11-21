export interface ExportColumn<T> {
    header: string;
    value: (row: T) => string | number | null | undefined;
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function escapeCell(value: string | number | null | undefined, separator: string): string {
    let s = value == null ? '' : String(value);
    if (typeof value === 'string' && /^[=+\-@]/.test(s)) s = `'${s}`;
    const needsQuotes = s.includes(separator) || /["\n\r]/.test(s);
    return needsQuotes ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportToCsv<T>(
    filename: string,
    columns: ExportColumn<T>[],
    rows: T[],
    separator = ';'
) {
    const header = columns.map(c => escapeCell(c.header, separator)).join(separator);
    const lines = rows.map(row =>
        columns.map(c => escapeCell(c.value(row), separator)).join(separator)
    );
    const csv = '\uFEFF' + [header, ...lines].join('\r\n');
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
}