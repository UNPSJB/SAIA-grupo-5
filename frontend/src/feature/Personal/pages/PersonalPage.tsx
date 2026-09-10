import { useState } from 'react'
import { mutate } from 'swr'
import { Alert, Button, Col, Container, Row, Spinner } from 'react-bootstrap'
import { type TableColumn } from 'react-data-table-component'

import { AppTable } from '../../../components/AppTable'
import { PageHeader } from '../../../components/PageHeader'
import { useApi } from '../../../hooks/useApi'
import { DeletePersonaModal } from '../components/DeletePersonaModal'
import type { Persona } from '../types'

export function PersonalPage() {
  const { data: personas, error, isLoading } = useApi<Persona[]>('/personal')
  const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null)
  if (isLoading) return (
    <>
      <PageHeader title="Listado de Personal" />
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </>
  )

  if (!personas || error) return (
    <Container>
      <PageHeader title="Listado de Personal" />
      <Row className="justify-content-center">
        <Col md={6}>
          <Alert variant="danger">Ocurrió un error al cargar Personal</Alert>
        </Col>
      </Row>
    </Container>
  )

  const columns: TableColumn<Persona>[] = [
    { name: 'ID', selector: (row) => row.id, sortable: true, center: true, maxWidth: '160px' },
    { name: 'Nombre', selector: (row) => row.nombre, sortable: true, center: true, minWidth: '200px', grow: 2 },
    {
      name: 'Capacidades',
      selector: (row) => row.capacidades.join(', '),
      cell: (row) => row.capacidades.join(' / '),
      sortable: true,
      center: true,
      grow: 2,
    },
    {
      name: 'Acciones',
      cell: (row) => (
        <Button variant="outline-danger" size="sm" onClick={() => setPersonaToDelete(row)}>
          eliminar
        </Button>
      ),
    }
  ]

  return (
    <Container>
      <Row className="p-2">
        <Col>
          <PageHeader title="Baja de Personal" />
        </Col>
      </Row>
      <AppTable columns={columns} data={personas} />
      <DeletePersonaModal
        persona={personaToDelete}
        onHide={() => setPersonaToDelete(null)}
        onDeleted={() => mutate('/personal')}
      />
    </Container>
  )
}