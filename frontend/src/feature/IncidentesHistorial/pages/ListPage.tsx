import React, { useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Row, Form, InputGroup, Spinner } from 'react-bootstrap';
import { type TableColumn } from 'react-data-table-component';
import { mutate } from 'swr';
import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { ActionButton } from '../../../components/ActionButton';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import { HistorialIncidenteModal } from '../../Incidentes/components/HistorialIncidenteModal';
import type { IncidenteSeguimiento } from '../types';
import '../../Incidentes/pages/ListPage.css';


type FiltroEstado = 'todos' | 'Abierto' | 'Cerrado';

function formatDate(value: string) {
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function IncidentesHistorialPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [tipoId, setTipoId] = useState('');
    const { data: tipos } = useApi('/tipos-incidentes/');

    const { pathname } = useLocation();

    const [estadoSeleccionado, setEstadoSeleccionado] = useState<{ pathname: string; value: FiltroEstado }>({
        pathname,
        value: pathname.startsWith('/incidentes/abiertos') ? 'Abierto' : 'todos',
    });
    const estado = estadoSeleccionado.pathname === pathname
        ? estadoSeleccionado.value
        : pathname.startsWith('/incidentes/abiertos') ? 'Abierto' : 'todos';

    const setEstado = (value: FiltroEstado) => setEstadoSeleccionado({ pathname, value });
    const [busqueda, setBusqueda] = useState('');
    const [incidenteParaHistorial, setIncidenteParaHistorial] = useState<IncidenteSeguimiento | null>(null);
    const estadoSeguimiento = estado === 'Abierto' ? 'abierto' : estado === 'Cerrado' ? 'cerrado' : 'todos';
    const orden = estadoSeguimiento === 'abierto' ? 'asc' : 'desc';

    const rangoValido = (!fechaDesde || !fechaHasta) || fechaDesde <= fechaHasta;
    const parametros = new URLSearchParams();
    
    if (estadoSeguimiento !== 'todos') { parametros.set('estado', estadoSeguimiento);}
    parametros.set('orden', orden);
    if (tipoId) { parametros.set('tipo_id', tipoId);}
    if (fechaDesde) { parametros.set('fecha_desde', fechaDesde); }
    if (fechaHasta) { parametros.set('fecha_hasta', fechaHasta); }
    const endpoint = rangoValido
        ? `/incidentes?${parametros.toString()}`
        : null;
    const { data: incidentes, error, isLoading, } = useApi<IncidenteSeguimiento[]>(endpoint);

    const parametrosEstadisticas = new URLSearchParams();
    parametrosEstadisticas.set('orden', orden);

    if (tipoId) { parametrosEstadisticas.set('tipo_id', tipoId); }
    if (fechaDesde) { parametrosEstadisticas.set('fecha_desde', fechaDesde); }
    if (fechaHasta) { parametrosEstadisticas.set('fecha_hasta', fechaHasta); }
    const endpointEstadisticas = rangoValido
        ? `/incidentes?${parametrosEstadisticas.toString()}`
        : null;
    const { data: incidentesEstadisticas, error: errorEstadisticas, } = useApi<IncidenteSeguimiento[]>(endpointEstadisticas);
    const incidentesActivos = (incidentesEstadisticas ?? []).filter((incidente) => incidente.activo);
    const total = incidentesActivos.length;
    const cantidadAbiertos = incidentesActivos.filter((incidente) => incidente.estado === 'Abierto').length;
    const cantidadCerrados = incidentesActivos.filter((incidente) => incidente.estado === 'Cerrado').length;
    const cantidadDemorados = incidentesActivos.filter((incidente) => incidente.nivel_demora === 'demorado').length;
    const porcentajeResueltos = total > 0
        ? Math.round((cantidadCerrados / total) * 1000) / 10
        : null;

    const incidentesFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLocaleLowerCase('es');
        return (incidentes ?? []).filter((incidente) =>
            incidente.activo &&
            `${incidente.nombre} ${incidente.descripcion} ${incidente.reportado_por}`
                .toLocaleLowerCase('es').includes(texto),
        );
    }, [busqueda, incidentes]);

    const columnas: TableColumn<IncidenteSeguimiento>[] = [
        {
            name: 'Incidente',
            selector: (incidente) => incidente.nombre,
            sortable: true,
            grow: 2,
            minWidth: '220px',
            cell: (incidente) => (
                <div className="incident-name-cell">
                    <strong>{incidente.nombre}</strong>
                    <div className="small text-muted mt-1 incident-description">{incidente.descripcion}</div>
                </div>
            ),
        },
        {
            name: 'Fecha',
            selector: (incidente) => incidente.fecha,
            sortable: true,
            minWidth: '170px',
            cell: (incidente) => <span className="text-nowrap">{formatDate(incidente.fecha)}</span>,
        },
        {
            name: 'Reportado por',
            selector: (incidente) => incidente.reportado_por,
            sortable: true,
            minWidth: '160px',
            wrap: true,
        },
        {
            name: 'Días abierto',
            selector: (incidente) => incidente.dias_abierto,
            sortable: true,
            minWidth: '130px',
            cell: (incidente) => (
                <div>
                    <span className={`incident-days${incidente.nivel_demora === 'demorado' ? ' is-delayed' : ''}`}>
                        {incidente.nivel_demora === 'demorado' && <i className="bi bi-exclamation-triangle-fill" aria-label="Demorado" />}
                        {incidente.dias_abierto} {incidente.dias_abierto === 1 ? 'día' : 'días'}
                    </span>
                    {incidente.nivel_demora === 'demorado' && <div><Badge bg="danger" className="mt-1">Demorado</Badge></div>}
                </div>
            ),
        },
        {
            name: 'Estado',
            selector: (incidente) => incidente.estado,
            sortable: true,
            minWidth: '110px',
            cell: (incidente) => <Badge bg={incidente.estado === 'Abierto' ? 'warning' : 'success'} text={incidente.estado === 'Abierto' ? 'dark' : undefined}>{incidente.estado}</Badge>,
        },
        {
            name: 'Acciones',
            center: true,
            minWidth: '160px',
            cell: (incidente) => (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '6px 0' }}>
                    {currentUser?.administrar && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <ActionButton
                                variant="outline-secondary"
                                size="sm"
                                tooltip="Ver historial"
                                icon="bi-clock-history"
                                onClick={() => setIncidenteParaHistorial(incidente)}
                            />
                            <ActionButton
                                variant="outline-info"
                                size="sm"
                                tooltip="Ver"
                                icon="bi-eye"
                                onClick={() => navigate(`/incidentes/${incidente.id}`, { state: { origen: "historial" }})}
                            />
                        </div>
                    )}
                </div>
            ),
        },
    ];

    const demorados = (incidentes ?? []).filter((incidente) => incidente.activo && incidente.nivel_demora === 'demorado').length;
    const abiertos = estado === 'Abierto';
    const titulo = pathname.startsWith('/incidentes/abiertos') ? 'Pendientes / Abiertos' : 'Incidentes';
    const fechaLarga = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="incident-page">
            <PageHeader
                eyebrow="SEGUIMIENTO Y PREVENCIÓN"
                title={titulo}
                subtitle={`${fechaLarga} - Revisá el historial de incidentes registrados`}                
                actions={(
                    <div className="d-flex align-items-center gap-2">
                        {abiertos && (
                            <Badge bg="warning" text="dark" className="page-header-summary">
                                <i className="bi bi-exclamation-triangle me-1" />{demorados} demorados
                            </Badge>
                        )}
                    </div>
                )}
            />
            <Row className="p-2 align-items-end g-3">
                <Col xs="auto">
                    <Form.Label className="mb-1 small fw-semibold"> Desde </Form.Label>
                    <Form.Control
                        type="date"
                        value={fechaDesde}
                        max={fechaHasta || undefined}
                        onChange={(e) => setFechaDesde(e.target.value)}
                    />
                </Col>
                <Col xs="auto">
                    <Form.Label className="mb-1 small fw-semibold"> Hasta </Form.Label>
                    <Form.Control
                        type="date"
                        value={fechaHasta}
                        min={fechaDesde || undefined}
                        onChange={(e) => setFechaHasta(e.target.value)}
                    />
                </Col>
                <Col xs="auto">
                    <Form.Label className="mb-1 small fw-semibold"> Tipo de incidente </Form.Label>
                    <Form.Select
                        value={tipoId}
                        onChange={(e) => setTipoId(e.target.value)}
                    >
                        <option value="">Todos los tipos</option>
                        {(tipos ?? [])
                            .filter((tipo: { activo: boolean }) => tipo.activo)
                            .map((tipo: { id: number; nombre: string }) => (
                                <option key={tipo.id} value={tipo.id}>
                                    {tipo.nombre}
                                </option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            {rangoValido && incidentesEstadisticas && !errorEstadisticas && (
                <Row className="p-2 g-3">
                    <Col xs={6} lg={3}>
                        <Card className="text-center h-100">
                            <Card.Body>
                                <Card.Subtitle className="text-muted mb-2"> Total de incidentes </Card.Subtitle>
                                <Card.Title className="fs-3 mb-0"> {total} </Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} lg={3}>
                        <Card className="text-center h-100">
                            <Card.Body>
                                <Card.Subtitle className="text-muted mb-2"> Abiertos </Card.Subtitle>
                                <Card.Title className="fs-3 mb-0 text-warning"> {cantidadAbiertos} </Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} lg={3}>
                        <Card className="text-center h-100">
                            <Card.Body>
                                <Card.Subtitle className="text-muted mb-2"> Cerrados </Card.Subtitle>
                                <Card.Title className="fs-3 mb-0 text-success"> {cantidadCerrados} </Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} lg={3}>
                        <Card className="text-center h-100">
                            <Card.Body>
                                <Card.Subtitle className="text-muted mb-2"> % de incidentes resueltos </Card.Subtitle>
                                <Card.Title className="fs-3 mb-0 text-success"> 
                                    {porcentajeResueltos === null
                                        ? "-"
                                        : `${porcentajeResueltos.toLocaleString('es-AR')}%`}
                                </Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {isLoading ? (
                <div className="incident-loading"><Spinner animation="border" role="status"><span className="visually-hidden">Cargando incidentes...</span></Spinner></div>
            ) : error ? (
                <Alert variant="danger">No se pudieron cargar los incidentes. Intentá nuevamente.</Alert>
            ) : (
                <Card className="incident-list-card">
                    <Card.Body>
                        <div className="incident-toolbar">
                            <div>
                                <strong>{incidentesFiltrados.length}</strong> {incidentesFiltrados.length === 1 ? 'incidente' : 'incidentes'}
                                {abiertos && <span className="text-muted"> · Sin acción correctiva</span>}
                            </div>
                            <div className="d-flex flex-column flex-sm-row gap-2 incident-filters">
                                <Form.Select
                                    aria-label="Filtrar incidentes por estado"
                                    value={estado}
                                    onChange={(event) => setEstado(event.target.value as FiltroEstado)}
                                    className="incident-state-filter"
                                >
                                    <option value="todos">Todos los estados</option>
                                    <option value="Abierto">Abiertos</option>
                                    <option value="Cerrado">Cerrados</option>
                                </Form.Select>
                                <InputGroup className="incident-search">
                                    <InputGroup.Text><i className="bi bi-search" aria-hidden="true" /></InputGroup.Text>
                                    <Form.Control
                                        type="search"
                                        aria-label="Buscar incidente"
                                        placeholder="Buscar incidente"
                                        value={busqueda}
                                        onChange={(event) => setBusqueda(event.target.value)}
                                    />
                                </InputGroup>
                            </div>
                        </div>

                        <div className="incident-table">
                            <AppTable
                                columns={columnas}
                                data={incidentesFiltrados}
                                pagination={incidentesFiltrados.length > 0}
                                conditionalRowStyles={[{
                                    when: (incidente) => incidente.nivel_demora === 'demorado',
                                    style: { backgroundColor: '#fff8f6' },
                                    classNames: ['incident-row-delayed'],
                                }, {
                                    when: (incidente) => !incidente.activo,
                                    style: { opacity: 0.55 },
                                    classNames: ['incident-row-inactive'],
                                }]}
                                noDataComponent={(
                                    <div className="incident-empty-state">
                                        <i className={`bi ${abiertos ? 'bi-check2-circle' : 'bi-search'}`} aria-hidden="true" />
                                        <strong>{abiertos && !busqueda ? 'No hay incidentes abiertos pendientes' : 'No se encontraron incidentes'}</strong>
                                        <span>{abiertos && !busqueda ? 'Los incidentes abiertos sin acción correctiva aparecerán acá.' : 'Probá cambiar el filtro o el término de búsqueda.'}</span>
                                    </div>
                                )}
                            />
                        </div>
                    </Card.Body>
                </Card>
            )}
            <HistorialIncidenteModal
                incidente={incidenteParaHistorial}
                onHide={() => setIncidenteParaHistorial(null)}
            />
        </div>
    );
}
