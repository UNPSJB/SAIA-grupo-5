import type { ComponentType, ReactNode } from 'react';
import DataTable, { type ColumnGroup, type ConditionalStyles, type ExpanderComponentProps, type TableColumn } from 'react-data-table-component';
import './AppTable.css';

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
    pagination?: boolean;
    noDataComponent?: ReactNode;
}

export function AppTable<T>({ columns, data, columnGroups, onColumnGroupOrderChange, conditionalRowStyles, expandableRows, expandableRowsComponent, pagination = true, noDataComponent }: AppTableProps<T>) {
    return (
        <DataTable
            columns={columns}
            data={data}
            columnGroups={columnGroups}
            onColumnGroupOrderChange={onColumnGroupOrderChange}
            conditionalRowStyles={conditionalRowStyles}
            expandableRows={expandableRows}
            expandableRowsComponent={expandableRowsComponent}
            pagination={pagination}
            noDataComponent={noDataComponent ?? <div className="p-4 text-muted">No se encontraron resultados.</div>}
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
