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
            noDataComponent={<div className="p-4 text-muted">No se encontraron resultados.</div>}      // Se agrego esto para mostrar un mensaje en caso de que no hayan insumos en la base o no se haya encontrado el insumo en el buscador
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
