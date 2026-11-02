import React, { useMemo, useState } from 'react';
import { Alert, Card, Col, Row, Form, InputGroup, Spinner } from 'react-bootstrap';
import { type TableColumn } from 'react-data-table-component';
import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { ActionButton } from '../../../components/ActionButton';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import type { LoteProduccion, LoteProduccionHistorial } from '../types';

function formatDate(value: string) {
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function LotesHistorialPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [productoId, setProductoId] = useState('');
    const { data: productos } = useApi('/productos/');

    const { pathname } = useLocation();

    const [busqueda, setBusqueda] = useState('');
    const orden = 'desc';

    const rangoValido = (!fechaDesde || !fechaHasta) || fechaDesde <= fechaHasta;
    const parametros = new URLSearchParams();
    
    parametros.set('orden', orden);
    if (productoId) { parametros.set('producto_id', productoId);}
    if (fechaDesde) { parametros.set('fecha_desde', fechaDesde); }
    if (fechaHasta) { parametros.set('fecha_hasta', fechaHasta); }
    const endpoint = rangoValido
        ? `/lotes-produccion/historial?${parametros.toString()}`
        : null;
    const { data: historial, error, isLoading } = useApi<LoteProduccionHistorial>(endpoint);

    const parametrosEstadisticas = new URLSearchParams();
    parametrosEstadisticas.set('orden', orden);

    if (fechaDesde) { parametrosEstadisticas.set('fecha_desde', fechaDesde); }
    if (fechaHasta) { parametrosEstadisticas.set('fecha_hasta', fechaHasta); }
    const endpointEstadisticas = rangoValido
        ? `/lotes-produccion/historial?${parametrosEstadisticas.toString()}`
        : null;
    const { data: historialEstadisticas, error: errorEstadisticas } = useApi<LoteProduccionHistorial>(endpointEstadisticas);
    const lotesActivos = (historialEstadisticas?.lotes ?? []).filter((lote) => lote.activo);
    const total = lotesActivos.length;
    const lotesProducto = (historial?.lotes ?? []).filter((lote) => lote.activo);
    const totalLotesProducto = lotesProducto.length;
    const totalProductosProducidos = historial?.total_producido ?? 0;
    const porcentajeLotes = total > 0
        ? Math.round((totalLotesProducto / total) * 1000) / 10
        : null;

    const lotesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es');
        return (historial?.lotes ?? []).filter((lote) =>
            lote.activo &&
            `${lote.nombre} ${lote.producto.nombre} ${lote.producto.descripcion} ${lote.cantidad_producida}`
                .toLocaleLowerCase('es').includes(texto),
        );
    }, [busqueda, historial]);

    const columnas: TableColumn<LoteProduccion>[] = [
        {
            name: 'Lote',
            selector: (lote) => lote.id,
            sortable: true,
            width: '100px',
        },
        {
            name: 'Producto',
            selector: (lote) => lote.producto.nombre,
            sortable: true,
            minWidth: '200px',
            wrap: true,
            cell: (lote) => (
                <div className="lote-name-cell">
                    <strong>{lote.producto.nombre}</strong>
                    <div className="small text-muted mt-1 lote-description">{lote.producto.descripcion}</div>
                </div>
            ),
        },
        {
            name: 'Cantidad',
            selector: (lote) => lote.cantidad_producida,
            sortable: true,
            width: '120px',
            wrap: true,
        },
        {
            name: 'Fecha de Produccion',
            selector: (lote) => lote.fecha_produccion,
            sortable: true,
            minWidth: '180px',
            cell: (lote) => <span className="text-nowrap">{formatDate(lote.fecha_produccion)}</span>,
        },
        {
            name: 'Fecha de Vencimiento',
            selector: (lote) => lote.fecha_vencimiento,
            sortable: true,
            minWidth: '180px',
            cell: (lote) => <span className="text-nowrap">{formatDate(lote.fecha_vencimiento)}</span>,
        },
        {
            name: 'Acciones',
            center: true,
            width: '100px',
            cell: (lote) => (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '6px 0' }}>
                    {currentUser?.administrar && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <ActionButton
                                variant="outline-info"
                                size="sm"
                                tooltip="Ver"
                                icon="bi-eye"
                                onClick={() => navigate(`/lotes-produccion/${lote.id}`, { state: { origen: "historial" }})}
                            />
                        </div>
                    )}
                </div>
            ),
        },
    ];

    const fechaLarga = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="lote-page">
            <PageHeader
                eyebrow="PRODUCCIÓN"
                title="Historial de Lotes de Producción"
                subtitle={`${fechaLarga} - Revisá el historial de lotes registrados`}                
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
                    <Form.Label className="mb-1 small fw-semibold"> Producto </Form.Label>
                    <Form.Select
                        value={productoId}
                        onChange={(e) => setProductoId(e.target.value)}
                    >
                        <option value="">Todos los productos</option>
                        {(productos ?? [])
                            .filter((producto: { activo: boolean }) => producto.activo)
                            .map((producto: { id: number; nombre: string }) => (
                                <option key={producto.id} value={producto.id}>
                                    {producto.nombre}
                                </option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            {rangoValido && historialEstadisticas && !errorEstadisticas && !error && (
                <Row className="p-2 g-3">
                    <Col xs={6} lg={3}>
                        <Card className="text-center h-100">
                            <Card.Body>
                                <Card.Subtitle className="text-muted mb-2"> Total de lotes </Card.Subtitle>
                                <Card.Title className="fs-3 mb-0"> {total} </Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                    {productoId && (
                        <>
                            <Col xs={6} lg={3}>
                                <Card className="text-center h-100">
                                    <Card.Body>
                                        <Card.Subtitle className="text-muted mb-2"> Lotes del producto </Card.Subtitle>
                                        <Card.Title className="fs-3 mb-0 text-success"> {totalLotesProducto} </Card.Title>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={6} lg={3}>
                                <Card className="text-center h-100">
                                    <Card.Body>
                                        <Card.Subtitle className="text-muted mb-2"> Productos producidos </Card.Subtitle>
                                        <Card.Title className="fs-3 mb-0 text-success"> {totalProductosProducidos} </Card.Title>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={6} lg={3}>
                                <Card className="text-center h-100">
                                    <Card.Body>
                                        <Card.Subtitle className="text-muted mb-2"> % del total de lotes </Card.Subtitle>
                                        <Card.Title className="fs-3 mb-0 text-success"> 
                                            {porcentajeLotes === null
                                                ? "-"
                                                : `${porcentajeLotes.toLocaleString('es-AR')}%`}
                                        </Card.Title>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </>
                    )}
                </Row>
            )}
            
            {isLoading ? (
                <div className="lote-loading"><Spinner animation="border" role="status"><span className="visually-hidden">Cargando lotes...</span></Spinner></div>
            ) : error ? (
                <Alert variant="danger">No se pudieron cargar los lotes. Intentá nuevamente.</Alert>
            ) : (
                <Card className="lote-list-card">
                    <Card.Body>
                        <div className="lote-toolbar">
                            <div>
                                <strong>{lotesFiltrados.length}</strong> {lotesFiltrados.length === 1 ? 'lote' : 'lotes'}
                            </div>
                            <div className="d-flex justify-content-end flex-grow-1 mb-3">
                                <InputGroup className="lote-search" style={{ maxWidth: '280px' }}>
                                    <InputGroup.Text><i className="bi bi-search" aria-hidden="true" /></InputGroup.Text>
                                    <Form.Control
                                        type="search"
                                        aria-label="Buscar lote"
                                        placeholder="Buscar lote"
                                        value={busqueda}
                                        onChange={(event) => setBusqueda(event.target.value)}
                                    />
                                </InputGroup>
                            </div>
                        </div>

                        <div className="lote-table">
                            <AppTable
                                columns={columnas}
                                data={lotesFiltrados}
                                pagination={lotesFiltrados.length > 0}
                                noDataComponent={(
                                    <div className="lote-empty-state">
                                        <i className={`bi ${busqueda ? 'bi-search' : 'bi-box-seam'}`} aria-hidden="true" />
                                        <strong> {busqueda ? 'No se encontraron lotes' : 'No hay lotes registrados'} </strong>
                                        <span> {busqueda ? 'Probá con otro nombre de lote o producto.' : 'Los lotes de producción registrados aparecerán acá.'} </span>
                                    </div>
                                )}
                            />
                        </div>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
}
