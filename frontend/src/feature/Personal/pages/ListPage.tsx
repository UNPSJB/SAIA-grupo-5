import { Alert, Badge, Button, Col, Container, OverlayTrigger, Row, Spinner, Tooltip } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { type TableColumn } from 'react-data-table-component'
import { mutate } from 'swr'

import { AppTable } from '../../../components/AppTable'
import { PageHeader } from '../../../components/PageHeader'
import { useApi } from '../../../hooks/useApi'
import { api } from '../../../libs/axios'
import { Capacidades } from '../../../types'
import type { Persona } from '../types'

const capacidadLabels: Record<string, string> = {
  [Capacidades.OPERAR]: 'Operar',
  [Capacidades.ADMINISTRAR]: 'Administrar',
}

export function ListPage() {
  const navigate = useNavigate()
  const { data: personal, error, isLoading } = useApi<Persona[]>('/personal/')

  const cambiarEstado = async (persona: Persona) => {
    try {
      await api.patch<Persona>(`/personal/${persona.id}/estado`)
      await mutate('/personal/')
    } catch (error) {
      alert(`No se pudo ${persona.activo ? 'dar de baja' : 'dar de alta'} la persona.`)
      console.log(error)
    }
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Listado de Personal" />
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </>
    )
  }

  if (!personal || error) {
    return (
      <Container>
        <PageHeader title="Listado de Personal" />
        <Row className="justify-content-center">
          <Col md={6}>
            <Alert variant="danger">Ocurrió un error al cargar Personal</Alert>
          </Col>
        </Row>
      </Container>
    )
  }

  const columns: TableColumn<Persona>[] = [
    {
      name: 'ID',
      selector: (row) => row.id,
      sortable: true,
      center: true,
      maxWidth: '160px',
    },
    {
      name: 'Nombre',
      selector: (row) => row.nombre,
      sortable: true,
      center: true,
      minWidth: '200px',
      grow: 2,
    },
    {
      name: 'Capacidades',
      selector: (row) => row.capacidades.join(', '),
      sortable: true,
      center: true,
      grow: 2,
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          {row.capacidades.length === 0 ? (
            <span className="text-muted">Sin capacidades</span>
          ) : (
            row.capacidades.map((capacidad) => (
              <Badge
                key={capacidad}
                bg={capacidad === Capacidades.ADMINISTRAR ? 'primary' : 'secondary'}
              >
                {capacidadLabels[capacidad] ?? capacidad}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      name: 'Estado',
      selector: (row) => row.activo ? 'Activo' : 'Dado de baja',
      sortable: true,
      center: true,
      cell: (row) => <Badge bg={row.activo ? 'success' : 'secondary'}>{row.activo ? 'Activo' : 'Dado de baja'}</Badge>,
    },
    {
      name: 'Acciones',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button
            variant="outline-primary"
            size="sm"
            disabled={!row.activo}
            onClick={() => navigate(`/personal/${row.id}/edit`)}
          >
            Editar
          </Button>
          <Button
            variant={row.activo ? 'outline-danger' : 'outline-success'}
            size="sm"
            onClick={() => cambiarEstado(row)}
          >
            {row.activo ? 'Dar de baja' : 'Dar de Alta'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Container>
      <Row className="p-2">
        <Col xs lg="11">
          <PageHeader title="Listado de Personal" />
        </Col>
        <Col>
          <OverlayTrigger
            placement="left"
            delay={{ show: 250, hide: 400 }}
            overlay={(props) => (
              <Tooltip id="button-tooltip" {...props}>
                Agregar Personal
              </Tooltip>
            )}
          >
            <Button size="sm" onClick={() => navigate('/personal/new')}>+</Button>
          </OverlayTrigger>
        </Col>
      </Row>
      <AppTable columns={columns} data={personal} />
    </Container>
  )
}
