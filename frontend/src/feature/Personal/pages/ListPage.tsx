import React, { useMemo, useState } from 'react'
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { type TableColumn } from 'react-data-table-component'
import { mutate } from 'swr'

import { AppTable } from '../../../components/AppTable'
import { PageHeader } from '../../../components/PageHeader'
import { useApi } from '../../../hooks/useApi'
import { api } from '../../../libs/axios'
import { Capacidades } from '../../Capacidades/types'
import type { Persona } from '../types'

const capacidadLabels: Record<string, string> = {
  [Capacidades.OPERAR]: 'Operar',
  [Capacidades.ADMINISTRAR]: 'Administrar',
}

export function ListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data: personal, error, isLoading } = useApi<Persona[]>('/personal/')

  const filteredPersonal = useMemo(() => {
    if (!Array.isArray(personal)) return []
    return (personal ?? []).filter((persona) => {
      const capacidadesTexto = persona.capacidades
        .map((capacidad) => capacidadLabels[capacidad] ?? capacidad)
        .join(' ')
      return (
        persona.nombre.toLowerCase().includes(search.toLowerCase()) ||
        capacidadesTexto.toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [search, personal])

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <Form.Control
        type="text"
        placeholder="Buscar personal..."
        className=" mr-sm-2"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
      />
    )
  }, [search])

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {row.capacidades.length === 0 ? (
            <span className="text-muted">Sin capacidades</span>
          ) : (
            row.capacidades.map((capacidad) => (
              <div
                key={capacidad}
                style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  background: capacidad === Capacidades.ADMINISTRAR ? '#dbeafe' : '#e5e7eb',
                  color: capacidad === Capacidades.ADMINISTRAR ? '#1d4ed8' : '#374151',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {capacidadLabels[capacidad] ?? capacidad}
              </div>
            ))
          )}
        </div>
      ),
    },
    {
      name: 'Estado',
      selector: (row) => (row.activo ? 'Activo' : 'Inactivo'),
      sortable: true,
      center: true,
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              padding: '4px 12px',
              borderRadius: '16px',
              background: row.activo ? '#dcfce7' : '#fee2e2',
              color: row.activo ? '#166534' : '#991b1b',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {row.activo ? 'Activo' : 'Inactivo'}
          </div>
        </div>
      ),
    },
    {
      name: 'Acciones',
      center: true,
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button
            variant="outline-primary"
            size="sm"
            disabled={!row.activo}
            onClick={() => navigate(`/personal/${row.id}/edit`)}
          >
            <i className="bi bi-pencil me-1"></i>Editar
          </Button>
          <Button
            variant={row.activo ? 'outline-danger' : 'outline-success'}
            size="sm"
            onClick={() => cambiarEstado(row)}
          >
            <i className={`bi ${row.activo ? 'bi-person-dash' : 'bi-person-check'} me-1`}></i>
            {row.activo ? 'Dar de baja' : 'Dar de Alta'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Container>
      <Row className="p-2" align-items-center>
        <Col>
          <PageHeader title="Listado de Personal" />
        </Col>
        <Col xs="auto" className="align-self-center">
          {subHeaderComponentMemo}
        </Col>
        <Col xs="auto" className="d-flex justify-content-end">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/personal/new')}
            style={{ whiteSpace: 'nowrap' }}
          >
            + Nuevo Personal
          </Button>
        </Col>
      </Row>
      <AppTable columns={columns} data={filteredPersonal} />
    </Container>
  )
}
