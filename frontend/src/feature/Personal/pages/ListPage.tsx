import React, { useMemo, useState } from 'react'
import { Button, ButtonGroup, Col, Container, Dropdown, Form, Row } from 'react-bootstrap'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { type TableColumn } from 'react-data-table-component'
import { mutate } from 'swr'

import { AppTable } from '../../../components/AppTable'
import { PageHeader } from '../../../components/PageHeader'
import { PageLoading } from '../../../components/PageLoading'
import { PageError } from '../../../components/PageError'
import { ActionButton } from '../../../components/ActionButton'
import { useApi } from '../../../hooks/useApi'
import { useAuth } from '../../../hooks/useAuth'
import { api } from '../../../libs/axios'
import { Capacidades } from '../../Capacidades/types'
import { DeletePersonaModal } from '../components/DeletePersonaModal'
import type { Persona } from '../types'
import type { VencimientoPersonal, FiltroVencimientos } from '../../VencimientoPersonal/types'
import {
  ESTADO_VENCIMIENTOS_LABELS,
  ESTADO_VENCIMIENTOS_ESTILOS,
  ESTADO_VENCIMIENTOS_ORDEN,
  FILTRO_VENCIMIENTOS_LABELS,
  calcularEstadoVencimientos,
} from '../../VencimientoPersonal/types'
import type { ConfiguracionSistema } from '../../ConfiguracionSistema/types'

const capacidadLabels: Record<string, string> = {
  [Capacidades.OPERAR]: 'Operar',
  [Capacidades.ADMINISTRAR]: 'Administrar',
}

export function ListPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  // Permite llegar con el filtro ya elegido, ej. desde las cards "Vencidos" /
  // "Próximos a vencer" del Home.
  const filtroVencimientos: FiltroVencimientos = (() => {
    const valor = searchParams.get('vencimientos')
    return valor === 'vencido' || valor === 'proximo' || valor === 'vigente' || valor === 'sin-vencimientos'
      ? valor
      : 'todos'
  })()
  const { data: personal, error, isLoading } = useApi<Persona[]>('/personal/')
  const { data: vencimientosPersonal } = useApi<VencimientoPersonal[]>('/vencimiento-personal/')
  const { data: configuracion } = useApi<ConfiguracionSistema>('/configuracion-sistema/')
  const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null)

  const diasAntelacion = configuracion?.dias_antelacion_vencimiento ?? 15

  const vencimientosPorPersona = useMemo(() => {
    const mapa = new Map<number, VencimientoPersonal[]>()
    for (const vencimiento of vencimientosPersonal ?? []) {
      const lista = mapa.get(vencimiento.persona_id) ?? []
      lista.push(vencimiento)
      mapa.set(vencimiento.persona_id, lista)
    }
    return mapa
  }, [vencimientosPersonal])

  const estadoVencimientosDe = (personaId: number) =>
    calcularEstadoVencimientos(vencimientosPorPersona.get(personaId) ?? [], diasAntelacion)

  const filteredPersonal = useMemo(() => {
    if (!Array.isArray(personal)) return []
    return (personal ?? []).filter((persona) => {
      const capacidadesTexto = (persona.capacidades || [])
        .map((capacidad) => capacidadLabels[capacidad] ?? capacidad)
        .join(' ')
      const searchLower = search.toLowerCase()
      const coincideBusqueda = (
        persona.nombre.toLowerCase().includes(searchLower) ||
        (persona.apellido && persona.apellido.toLowerCase().includes(searchLower)) ||
        (persona.username && persona.username.toLowerCase().includes(searchLower)) ||
        (persona.dni && persona.dni.toLowerCase().includes(searchLower)) ||
        capacidadesTexto.toLowerCase().includes(searchLower)
      )
      const coincideFiltroVencimiento = filtroVencimientos === 'todos'
        || estadoVencimientosDe(persona.id) === filtroVencimientos

      return coincideBusqueda && coincideFiltroVencimiento
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- estadoVencimientosDe depende de vencimientosPorPersona/diasAntelacion, ya listados
  }, [search, personal, filtroVencimientos, vencimientosPorPersona, diasAntelacion])

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <Form.Control
        type="text"
        placeholder="Buscar personal..."
        className="mr-sm-2"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
      />
    )
  }, [])

  const cambiarEstado = async (persona: Persona) => {
    try {
      await api.patch<Persona>(`/personal/${persona.id}/estado`)
      await mutate('/personal/')
    } catch (err: any) {
      const detail = err.response?.data?.detail || `No se pudo ${persona.activo ? 'dar de baja' : 'dar de alta'} la persona.`
      alert(detail)
      console.log(err)
    }
  }

  if (isLoading) {
    return <PageLoading title="Listado de Personal" />
  }

  if (!personal || error) {
    return <PageError title="Listado de Personal" message="Ocurrió un error al cargar Personal" />
  }

  const baseColumns: TableColumn<Persona>[] = [
    {
      name: 'Nombre y Apellido',
      selector: (row) => `${row.nombre} ${row.apellido || ''}`.trim(),
      sortable: true,
      center: true,
      minWidth: '180px',
      grow: 2,
    },
    {
      name: 'Usuario',
      selector: (row) => row.username || '',
      sortable: true,
      center: true,
      minWidth: '120px',
    },
    {
      name: 'DNI',
      selector: (row) => row.dni || '',
      sortable: true,
      center: true,
      minWidth: '110px',
    },
    {
      name: 'Vencimientos',
      selector: (row) => ESTADO_VENCIMIENTOS_ORDEN[estadoVencimientosDe(row.id)],
      sortable: true,
      center: true,
      minWidth: '150px',
      cell: (row) => {
        const estado = estadoVencimientosDe(row.id)
        const estilos = ESTADO_VENCIMIENTOS_ESTILOS[estado]
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                padding: '3px 10px',
                borderRadius: '14px',
                background: estilos.background,
                color: estilos.color,
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {ESTADO_VENCIMIENTOS_LABELS[estado]}
            </div>
          </div>
        )
      },
    },
    {
      name: 'Capacidades',
      selector: (row) => (row.capacidades || []).join(', '),
      sortable: true,
      center: true,
      grow: 2,
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
          {!row.capacidades || row.capacidades.length === 0 ? (
            <span className="text-muted">Sin capacidades</span>
          ) : (
            row.capacidades.map((capacidad) => (
              <div
                key={capacidad}
                style={{
                  padding: '3px 10px',
                  borderRadius: '14px',
                  background: capacidad === Capacidades.ADMINISTRAR ? '#dbeafe' : '#e5e7eb',
                  color: capacidad === Capacidades.ADMINISTRAR ? '#1d4ed8' : '#374151',
                  fontWeight: 600,
                  fontSize: '0.85rem',
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
              padding: '3px 10px',
              borderRadius: '14px',
              background: row.activo ? '#dcfce7' : '#fee2e2',
              color: row.activo ? '#166534' : '#991b1b',
              fontWeight: 600,
              fontSize: '0.85rem',
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
  ]

  const columns: TableColumn<Persona>[] = currentUser?.administrar
    ? [
      ...baseColumns,
      {
        name: 'Acciones',
        center: true,
        minWidth: '260px',
        cell: (row) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ActionButton
              variant="outline-secondary"
              size="sm"
              tooltip="Ver vencimientos"
              icon="bi-calendar-check"
              onClick={() => navigate(`/personal/${row.id}/vencimientos`)}
            />
            <ActionButton
              variant="outline-primary"
              size="sm"
              tooltip="Editar"
              icon="bi-pencil"
              disabled={!row.activo}
              onClick={() => navigate(`/personal/${row.id}/edit`)}
            />
            <ActionButton
              variant="outline-warning"
              size="sm"
              tooltip="Vencimientos"
              icon="bi-calendar-check"
              onClick={() => navigate(`/personal/${row.id}/vencimientos`)}
            />
            {row.activo ? (
              <ActionButton
                variant="outline-danger"
                size="sm"
                tooltip="Dar de baja"
                icon="bi-dash-circle"
                onClick={() => setPersonaToDelete(row)}
              />
            ) : (
              <ActionButton
                variant="outline-success"
                size="sm"
                tooltip="Dar de alta"
                icon="bi-check-circle"
                onClick={() => cambiarEstado(row)}
              />
            )}
          </div>
        ),
      },
    ]
    : baseColumns

  return (
    <Container>
      <Row className="p-2 align-items-center">
        <Col>
          <PageHeader title="Listado de Personal" />
        </Col>
        <Col xs="auto" className="align-self-center">
          {subHeaderComponentMemo}
        </Col>
        <Col xs="auto" className="align-self-center">
          <Dropdown as={ButtonGroup}>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setSearchParams({})}
            >
              Vencimientos: {FILTRO_VENCIMIENTOS_LABELS[filtroVencimientos]}
            </Button>
            <Dropdown.Toggle
              split
              variant="outline-secondary"
              size="sm"
              id="dropdown-filtro-vencimientos-personal"
            />
            <Dropdown.Menu>
              {(Object.entries(FILTRO_VENCIMIENTOS_LABELS) as [FiltroVencimientos, string][]).map(([valor, label]) => (
                <Dropdown.Item
                  key={valor}
                  active={filtroVencimientos === valor}
                  onClick={() => setSearchParams(valor === 'todos' ? {} : { vencimientos: valor })}
                >
                  {label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        {currentUser?.administrar && (
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
        )}
      </Row>
      <AppTable columns={columns} data={filteredPersonal} />
      <DeletePersonaModal
        persona={personaToDelete}
        onHide={() => setPersonaToDelete(null)}
        onDeleted={() => mutate('/personal/')}
      />
    </Container>
  )
}
