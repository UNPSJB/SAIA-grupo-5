import { type TableColumn } from 'react-data-table-component'

import { AppTable } from '../../../components/AppTable'
import { PageHeader } from '../../../components/PageHeader'
import { Capacidades } from '../../../types'
import type { Capacidad } from '../types'

const capacidades: Capacidad[] = [
  {
    id: 1,
    nombre: Capacidades.OPERAR,
    descripcion: 'Puede operar las funcionalidades del sistema.',
  },
  {
    id: 2,
    nombre: Capacidades.ADMINISTRAR,
    descripcion: 'Puede administrar la configuración y los recursos.',
  },
]

const columns: TableColumn<Capacidad>[] = [
  {
    name: 'ID',
    selector: (row) => row.id,
    sortable: true,
    center: true,
    maxWidth: '160px',
  },
  {
    name: 'Capacidad',
    selector: (row) => row.nombre,
    sortable: true,
    center: true,
    minWidth: '200px',
    grow: 1,
  },
  {
    name: 'Descripción',
    selector: (row) => row.descripcion,
    sortable: true,
    grow: 2,
  },
]

export function ListPage() {
  return (
    <main className="page-container">
      <PageHeader title="Listado de Capacidades" />
      <AppTable columns={columns} data={capacidades} />
    </main>
  )
}