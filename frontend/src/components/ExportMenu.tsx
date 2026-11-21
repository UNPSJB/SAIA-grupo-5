import { Dropdown } from 'react-bootstrap';
import type { TableColumn } from 'react-data-table-component';
import { exportToCsv, type ExportColumn } from './Exportcsv';
import { exportTableToPdf } from './Exportpdf';

interface ExportMenuProps<T> {
    title: string;
    filename: string;
    rows: T[];
    columns?: TableColumn<T>[];
    exportColumns?: ExportColumn<T>[];
    orientation?: 'portrait' | 'landscape';
}

function fromTableColumns<T>(columns: TableColumn<T>[]): ExportColumn<T>[] {
    return columns
        .filter(c => c.selector && typeof c.name === 'string')
        .map(c => ({
            header: c.name as string,
            value: (row: T) => c.selector!(row, 0) as string | number | null | undefined,
        }));
}

export function ExportMenu<T>({
    title,
    filename,
    rows,
    columns,
    exportColumns,
    orientation,
}: ExportMenuProps<T>) {
    const cols = exportColumns ?? fromTableColumns(columns ?? []);

    return (
        <Dropdown data-tour="exportar-listado">
            <Dropdown.Toggle variant="outline-primary" size="sm" disabled={rows.length === 0}>
                <i className="bi bi-download me-1" />Descargar
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
                <Dropdown.Item
                    onClick={() => exportTableToPdf({ title, filename, columns: cols, rows, orientation })}
                >
                    <i className="bi bi-file-earmark-pdf me-2" /> Descargar PDF
                </Dropdown.Item>
                <Dropdown.Item onClick={() => exportToCsv(filename, cols, rows)}>
                    <i className="bi bi-filetype-csv me-2" /> Descargar CSV
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}