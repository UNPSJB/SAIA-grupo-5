import { useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Form, InputGroup, Modal, Spinner, Table } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import type { EstadoIncidente, Incidente } from '../types';
import './IncidentesPage.css';

type FiltroEstado = 'todos' | EstadoIncidente;

function formatDate(value: string) {
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function IncidentesPage() {
    const { pathname } = useLocation();
    const [estadoSeleccionado, setEstadoSeleccionado] = useState<{ pathname: string; value: FiltroEstado }>({
        pathname,
        value: pathname.startsWith('/incidentes/abiertos') ? 'abierto' : 'todos',
    });
    const estado = estadoSeleccionado.pathname === pathname
        ? estadoSeleccionado.value
        : pathname.startsWith('/incidentes/abiertos') ? 'abierto' : 'todos';
    const setEstado = (value: FiltroEstado) => setEstadoSeleccionado({ pathname, value });
    const [busqueda, setBusqueda] = useState('');
    const [incidenteDetalle, setIncidenteDetalle] = useState<Incidente | null>(null);
    const orden = estado === 'abierto' ? 'asc' : 'desc';
    const endpoint = estado === 'todos'
        ? `/incidentes?orden=${orden}`
        : `/incidentes?estado=${estado}&orden=${orden}`;
    const { data: incidentes, error, isLoading } = useApi<Incidente[]>(endpoint);

    const incidentesFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLocaleLowerCase('es');
        return (incidentes ?? []).filter((incidente) =>
            `${incidente.nombre} ${incidente.descripcion} ${incidente.tipo.nombre} ${incidente.reportado_por}`
                .toLocaleLowerCase('es').includes(texto),
        );
    }, [busqueda, incidentes]);

    const demorados = (incidentes ?? []).filter((incidente) => incidente.nivel_demora === 'demorado').length;
    const abiertos = estado === 'abierto';
    const titulo = pathname.startsWith('/incidentes/abiertos') ? 'Pendientes / Abiertos' : 'Incidentes';

    return (
        <div className="incident-page">
            <div className="incident-heading">
                <div>
                    <span className="incident-eyebrow">SEGUIMIENTO Y PREVENCIÓN</span>
                    <h1>{titulo}</h1>
                    <p>Revisá los incidentes reportados y consultá las acciones correctivas registradas.</p>
                </div>
                {abiertos && <Badge bg="warning" text="dark" className="incident-summary"><i className="bi bi-exclamation-triangle me-1" />{demorados} demorados</Badge>}
            </div>

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
                                    <option value="abierto">Abiertos</option>
                                    <option value="cerrado">Cerrados</option>
                                </Form.Select>
                                <InputGroup className="incident-search">
                                    <InputGroup.Text><i className="bi bi-search" aria-hidden="true" /></InputGroup.Text>
                                    <Form.Control
                                        type="search"
                                        aria-label="Buscar incidentes"
                                        placeholder="Buscar por tipo, descripción o reportante..."
                                        value={busqueda}
                                        onChange={(event) => setBusqueda(event.target.value)}
                                    />
                                </InputGroup>
                            </div>
                        </div>

                        {incidentesFiltrados.length === 0 ? (
                            <div className="incident-empty-state">
                                <i className={`bi ${abiertos ? 'bi-check2-circle' : 'bi-search'}`} aria-hidden="true" />
                                <strong>{abiertos && !busqueda ? 'No hay incidentes abiertos pendientes' : 'No se encontraron incidentes'}</strong>
                                <span>{abiertos && !busqueda ? 'Los incidentes abiertos sin acción correctiva aparecerán acá.' : 'Probá cambiar el filtro o el término de búsqueda.'}</span>
                            </div>
                        ) : (
                            <Table responsive hover className="align-middle mb-0 incident-table">
                                <thead><tr><th>Incidente</th><th>Tipo</th><th>Fecha</th><th>Reportado por</th><th>Días abierto</th><th>Estado</th><th>Detalle</th></tr></thead>
                                <tbody>
                                    {incidentesFiltrados.map((incidente) => (
                                        <tr key={incidente.id} className={incidente.nivel_demora === 'demorado' ? 'incident-row-delayed' : undefined}>
                                            <td>
                                                <strong>{incidente.nombre}</strong>
                                                <div className="small text-muted mt-1 incident-description">{incidente.descripcion}</div>
                                            </td>
                                            <td><Badge bg="light" text="dark" className="incident-type">{incidente.tipo.nombre}</Badge></td>
                                            <td className="text-nowrap">{formatDate(incidente.fecha)}</td>
                                            <td className="text-nowrap">{incidente.reportado_por}</td>
                                            <td>
                                                <span className={`incident-days${incidente.nivel_demora === 'demorado' ? ' is-delayed' : ''}`}>
                                                    {incidente.nivel_demora === 'demorado' && <i className="bi bi-exclamation-triangle-fill" aria-label="Demorado" />}
                                                    {incidente.dias_abierto} {incidente.dias_abierto === 1 ? 'día' : 'días'}
                                                </span>
                                                {incidente.nivel_demora === 'demorado' && <div><Badge bg="danger" className="mt-1">Demorado</Badge></div>}
                                            </td>
                                            <td><Badge bg={incidente.estado === 'abierto' ? 'warning' : 'success'} text={incidente.estado === 'abierto' ? 'dark' : undefined}>{incidente.estado === 'abierto' ? 'Abierto' : 'Cerrado'}</Badge></td>
                                            <td>
                                                <Button variant="outline-primary" size="sm" onClick={() => setIncidenteDetalle(incidente)} aria-label={`Ver detalle de ${incidente.nombre}`}>
                                                    {incidente.foto_url ? <i className="bi bi-image me-1" aria-hidden="true" /> : <i className="bi bi-card-text me-1" aria-hidden="true" />}
                                                    Ver
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            )}

            <Modal show={incidenteDetalle !== null} onHide={() => setIncidenteDetalle(null)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{incidenteDetalle?.nombre ?? 'Detalle del incidente'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {incidenteDetalle && (
                        <div className="incident-detail">
                            <div className="d-flex flex-wrap gap-2 mb-3">
                                <Badge bg={incidenteDetalle.estado === 'abierto' ? 'warning' : 'success'} text={incidenteDetalle.estado === 'abierto' ? 'dark' : undefined}>
                                    {incidenteDetalle.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
                                </Badge>
                                <Badge bg="light" text="dark" className="incident-type">{incidenteDetalle.tipo.nombre}</Badge>
                                <span className="text-muted small">{formatDate(incidenteDetalle.fecha)} · Reportado por {incidenteDetalle.reportado_por}</span>
                            </div>
                            <p className="incident-detail-description">{incidenteDetalle.descripcion}</p>
                            {incidenteDetalle.foto_url ? (
                                <img className="incident-detail-photo" src={incidenteDetalle.foto_url} alt={`Foto del incidente: ${incidenteDetalle.nombre}`} />
                            ) : (
                                <div className="incident-no-photo"><i className="bi bi-image me-2" />Este incidente no tiene una foto adjunta.</div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setIncidenteDetalle(null)}>Cerrar</Button></Modal.Footer>
            </Modal>
        </div>
    );
}
