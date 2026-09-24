import DataTable, { type ColumnGroup, type TableColumn } from 'react-data-table-component';

const customStyles = {
    headCells: {
        style: {
            fontWeight: "bold",
        },
    },
};

interface AppTableProps<T> {
    columns: TableColumn<T>[];
    data: T[];
    columnGroups?: ColumnGroup[];
    onColumnGroupOrderChange?: (nextGroups: ColumnGroup[], nextColumns: TableColumn<T>[]) => void;
}

export function AppTable<T>({ columns, data, columnGroups, onColumnGroupOrderChange }: AppTableProps<T>) {
    return (
        <DataTable
            columns={columns}
            data={data}
            columnGroups={columnGroups}
            onColumnGroupOrderChange={onColumnGroupOrderChange}
            pagination
            noDataComponent={<div className="p-4 text-muted">No se encontraron resultados.</div>}
            paginationComponentOptions={{
                rowsPerPageText: "Filas por página",
                rangeSeparatorText: "de",
                selectAllRowsItem: false,
                selectAllRowsItemText: "Todos",
            }}
            animateRows
            columnSeparator="full"
            headerSeparator="full"
            highlightOnHover
            theme="crisp"
            customStyles={customStyles}
        />
    );
}
