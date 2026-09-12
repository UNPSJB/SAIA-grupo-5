import DataTable, { type TableColumn } from 'react-data-table-component';

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
}

export function AppTable<T>({ columns, data }: AppTableProps<T>) {
    return (
        <DataTable
            columns={columns}
            data={data}
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
