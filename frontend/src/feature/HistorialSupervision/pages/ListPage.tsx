import { useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { type ConditionalStyles, type TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from '../../../components/ActionButton';
import { AppTable } from '../../../components/AppTable';
import { EstadoBadge } from '../../../components/EstadoBadge';
import { ExportMenu } from '../../../components/ExportMenu';
import { PageHeader } from '../../../components/PageHeader';
import { useAuth } from '../../../hooks';
import { useApi } from '../../../hooks/useApi';
import type { SupervisionOcurrencia } from '../../ChecklistSupervision/types';
import { ESTADO_HISTORIAL_ESTILOS } from '../../Historial/types';
import { AppSwitch } from '../../../components/AppSwitch';

function toISODate(fecha: Date): string {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function HistorialSupervisionPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const hoy = useMemo(() => new Date(), []);
    const hace7dias = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d;
    }, []);

    const [fechaHasta, setFechaHasta] = useState(toISODate(hoy));
    const [fechaDesde, setFechaDesde] = useState(toISODate(hace7dias));
    const [soloMios, setSoloMios] = useState(false);
    const [soloPendientes, setSoloPendientes] = useState(false);

    const rangoValido = Boolean(fechaDesde) && Boolean(fechaHasta) && fechaDesde <= fechaHasta;

    const url = rangoValido
        ? `/supervision-lotes/historial?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}${soloMios ? '&solo_mios=true' : ''}`
        : null;

    const { data: historial, error, isLoading } = useApi<SupervisionOcurrencia[]>(url);

    const { total, completadas, pendientes, porcentajeCumplimiento } = useMemo(() => {
        const lista = historial ?? [];
        const totalOcurrencias = lista.length;
        const completadasList = lista.filter((oc) => oc.estado === 'Completada');
        const pendientesList = lista.filter((oc) => oc.estado !== 'Completada');

        return {
            total: totalOcurrencias,
            completadas: completadasList.length,
            pendientes: pendientesList,
            porcentajeCumplimiento:
                totalOcurrencias > 0 ? Math.round((completadasList.length / totalOcurrencias) * 100) : null,
        };
    }, [historial]);

    const columns = useMemo<TableColumn<SupervisionOcurrencia>[]>(
        () => [
            {
                id: 'paso',
                name: 'Paso',
                center: true,
                wrap: true,
                selector: (row) => row.paso_descripcion_snap,
                sortable: true,
                grow: 2,
            },
            {
                id: 'etapa',
                name: 'Etapa',
                center: true,
                selector: (row) => row.etapa_nombre_snap,
                sortable: true,
                grow: 1.2,
            },
            {
                id: 'lote',
                name: 'Lote / Producto',
                center: true,
                sortable: true,
                selector: (row) => row.lote_produccion_id,
                grow: 1.4,
                cell: (row) => (
                    <div className="text-center py-1">
                        <div className="fw-semibold">
                            Lote #{row.lote_produccion_id} - {row.producto_nombre_snap}
                        </div>
                        <Badge bg={row.fase_lote_snap === 'En produccion' ? 'warning' : 'info'} text="dark">
                            {row.fase_lote_snap}
                        </Badge>
                    </div>
                ),
            },
            {
                id: 'supervisor',
                name: 'Supervisor',
                center: true,
                sortable: true,
                selector: (row) =>
                    row.supervisor ? `${row.supervisor.nombre} ${row.supervisor.apellido}` : '-',
            },
            {
                id: 'fecha_completado',
                name: 'Fecha Completado',
                center: true,
                sortable: true,
                selector: (row) => row.fecha_completado ?? '',
                cell: (row) =>
                    row.fecha_completado ? new Date(row.fecha_completado).toLocaleString('es-AR') : '-',
            },
            {
                id: 'estado',
                name: 'Estado',
                center: true,
                sortable: true,
                selector: (row) => row.estado,
                cell: (row) => {
                    const clave = row.estado === 'Completada' ? 'Completada' : 'Pendiente';
                    return (
                        <EstadoBadge
                            tono={ESTADO_HISTORIAL_ESTILOS[clave].tono}
                            icono={ESTADO_HISTORIAL_ESTILOS[clave].icono}
                        >
                            {row.estado}
                        </EstadoBadge>
                    );
                },
            },
            {
                id: 'detalle',
                name: 'Detalle',
                center: true,
                cell: (row) => (
                    <ActionButton
                        variant="outline-info"
                        size="sm"
                        tooltip="Ver detalle"
                        icon="bi-eye"
                        onClick={() => navigate(`/supervision-lotes/${row.id}`)}
                    />
                ),
            },
        ],
        [navigate]
    );

    const conditionalRowStyles: ConditionalStyles<SupervisionOcurrencia>[] = [
        {
            when: (row) => row.estado === 'Completada',
            style: { backgroundColor: '#f0fdf4' },
        },
        {
            when: (row) => row.estado !== 'Completada',
            style: { backgroundColor: '#fefce8' },
        },
    ];

    const fechaLarga = new Date().toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    const filasTabla = (soloPendientes ? pendientes : historial) ?? [];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="PRODUCCION"
                        title="Historial de Supervision de Lotes"
                        subtitle={`${fechaLarga} - Revisa el historial de pasos supervisados en produccion y empaquetado`}
                    />
                </Col>
            </Row>

            <Row className="p-2 align-items-end g-3">
                <Col xs="auto">
                    <div className="d-flex flex-wrap align-items-end gap-3">
                        <div>
                            <Form.Label className="mb-1 small fw-semibold">Desde</Form.Label>
                            <Form.Control
                                type="date"
                                value={fechaDesde}
                                max={fechaHasta}
                                onChange={(e) => setFechaDesde(e.target.value)}
                            />
                        </div>
                        <div>
                            <Form.Label className="mb-1 small fw-semibold">Hasta</Form.Label>
                            <Form.Control
                                type="date"
                                value={fechaHasta}
                                min={fechaDesde}
                                onChange={(e) => setFechaHasta(e.target.value)}
                            />
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => {
                                    const hoyIso = toISODate(new Date());
                                    setFechaDesde(hoyIso);
                                    setFechaHasta(hoyIso);
                                }}
                            >
                                Hoy (Dia)
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => {
                                    const ahora = new Date();
                                    const sem = new Date();
                                    sem.setDate(ahora.getDate() - 7);
                                    setFechaDesde(toISODate(sem));
                                    setFechaHasta(toISODate(ahora));
                                }}
                            >
                                Ultima Semana
                            </Button>
                        </div>
                    </div>
                </Col>
                <Col className="d-flex flex-wrap justify-content-end align-items-center gap-2">
                    {currentUser?.supervisor && (
                        <AppSwitch
                            id="switch-solo-mios-supervision"
                            label="Solo supervisados por mi"
                            checked={soloMios}
                            onChange={(e) => setSoloMios(e.target.checked)}
                            className="me-2 small fw-semibold"
                        />
                    )}
                    <ExportMenu
                        title="Historial de Supervision de Lotes"
                        filename="historial-supervision-lotes"
                        rows={filasTabla}
                        exportColumns={[
                            { header: 'Paso', value: (r) => r.paso_descripcion_snap },
                            { header: 'Etapa', value: (r) => r.etapa_nombre_snap },
                            { header: 'Lote', value: (r) => `Lote #${r.lote_produccion_id} - ${r.producto_nombre_snap}` },
                            { header: 'Fase', value: (r) => r.fase_lote_snap },
                            {
                                header: 'Supervisor',
                                value: (r) => (r.supervisor ? `${r.supervisor.nombre} ${r.supervisor.apellido}` : '-'),
                            },
                            {
                                header: 'Fecha Completado',
                                value: (r) =>
                                    r.fecha_completado ? new Date(r.fecha_completado).toLocaleString('es-AR') : '-',
                            },
                            { header: 'Estado', value: (r) => r.estado },
                        ]}
                    />
                    <Button
                        variant="outline-warning"
                        size="sm"
                        active={soloPendientes}
                        onClick={() => setSoloPendientes((prev) => !prev)}
                    >
                        <i className="bi bi-funnel me-1"></i>
                        {soloPendientes ? 'Ver todas' : 'Ver solo pendientes'}
                    </Button>
                </Col>
            </Row>

            {!rangoValido && (
                <Row className="p-2 g-3">
                    <Col>
                        <Alert variant="warning">
                            Selecciona un rango de fechas valido (la fecha "Desde" debe ser anterior o igual a "Hasta").
                        </Alert>
                    </Col>
                </Row>
            )}

            {rangoValido && isLoading && (
                <Row className="p-2">
                    <Col>
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </Col>
                </Row>
            )}

            {rangoValido && error && (
                <Row className="p-2">
                    <Col md={6}>
                        <Alert variant="danger">Ocurrio un error al cargar el historial de supervision.</Alert>
                    </Col>
                </Row>
            )}

            {rangoValido && historial && !error && (
                <>
                    <Row className="p-2 g-3">
                        <Col md={3} sm={6}>
                            <Card className="text-center h-100">
                                <Card.Body>
                                    <Card.Subtitle className="text-muted mb-2">Total de Pasos</Card.Subtitle>
                                    <Card.Title className="fs-3 mb-0">{total}</Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6}>
                            <Card className="text-center h-100">
                                <Card.Body>
                                    <Card.Subtitle className="text-muted mb-2">Completadas</Card.Subtitle>
                                    <Card.Title className="fs-3 mb-0 text-success">{completadas}</Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6}>
                            <Card className="text-center h-100">
                                <Card.Body>
                                    <Card.Subtitle className="text-muted mb-2">Pendientes</Card.Subtitle>
                                    <Card.Title className="fs-3 mb-0 text-warning">{pendientes.length}</Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6}>
                            <Card className="text-center h-100">
                                <Card.Body>
                                    <Card.Subtitle className="text-muted mb-2">% de Cumplimiento</Card.Subtitle>
                                    <Card.Title className="fs-3 mb-0">
                                        {porcentajeCumplimiento === null ? '-' : `${porcentajeCumplimiento}%`}
                                    </Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row className="p-2">
                        <Col>
                            {filasTabla.length === 0 ? (
                                <Alert variant="info">
                                    {soloPendientes
                                        ? 'No hay pasos de supervision pendientes en el rango seleccionado.'
                                        : 'No hay registros de supervision para el rango de fechas seleccionado.'}
                                </Alert>
                            ) : (
                                <AppTable
                                    columns={columns}
                                    data={filasTabla}
                                    conditionalRowStyles={conditionalRowStyles}
                                />
                            )}
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
}
