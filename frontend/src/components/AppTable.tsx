import type { ComponentType } from 'react';
import DataTable, { type ColumnGroup, type ConditionalStyles, type ExpanderComponentProps, type TableColumn } from 'react-data-table-component';

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
    conditionalRowStyles?: ConditionalStyles<T>[];
    expandableRows?: boolean;
    expandableRowsComponent?: ComponentType<ExpanderComponentProps<T>>;
}

export function AppTable<T>({ columns, data, columnGroups, onColumnGroupOrderChange, conditionalRowStyles, expandableRows, expandableRowsComponent }: AppTableProps<T>) {
    return (
        <DataTable
            columns={columns}
            data={data}
            columnGroups={columnGroups}
            onColumnGroupOrderChange={onColumnGroupOrderChange}
            conditionalRowStyles={conditionalRowStyles}
            expandableRows={expandableRows}
            expandableRowsComponent={expandableRowsComponent}
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
