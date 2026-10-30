import { Container } from 'react-bootstrap'
import { type TableColumn } from 'react-data-table-component'

import { AppTable } from '../../../components/AppTable'
import { PageHeader } from '../../../components/PageHeader'
import { Capacidades, type CapacidadItem } from '../types'

const capacidades: CapacidadItem[] = [
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
  {
    id: 3,
    nombre: Capacidades.SUPERVISOR,
    descripcion: 'Puede supervisar las operaciones del sistema.',
  },
]

const columns: TableColumn<CapacidadItem>[] = [
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
    <Container>
      <PageHeader title="Listado de Capacidades" />
      <AppTable columns={columns} data={capacidades} />
    </Container>
  )
}
