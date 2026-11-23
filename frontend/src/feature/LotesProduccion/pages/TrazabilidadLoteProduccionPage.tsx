import { useMemo, useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { ActionButton } from '../../../components/ActionButton';
import { ExportMenu } from '../../../components/ExportMenu';
import { ListFilter } from '../../../components/ListFilter';
import { PageError } from '../../../components/PageError';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { useApi } from '../../../hooks/useApi';
import type { TrazabilidadLoteProduccionData, TrazabilidadOrigenInsumo } from '../types';

const TITULO = 'Trazabilidad del lote de producción';
const SIN_PROVEEDOR = 'Sin proveedor';

const formatearFecha = (fecha?: string | null) => (fecha ? fecha.slice(0, 10).split('-').reverse().join('/') : '-');

export function TrazabilidadLoteProduccionPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState('');
    const [proveedorFiltro, setProveedorFiltro] = useState('todos');

    const { data, isLoading, error } = useApi<TrazabilidadLoteProduccionData>(`/lotes-produccion/${id}/trazabilidad`);
    const origenes = useMemo(() => data?.origenes ?? [], [data]);

    const opcionesProveedor = useMemo(() => {
        const opciones: Record<string, string> = { todos: 'Todos los proveedores' };
        origenes.forEach((origen) => {
            const nombre = origen.proveedor_nombre ?? SIN_PROVEEDOR;
            opciones[nombre] = nombre;
        });
        return opciones;
    }, [origenes]);

    const filtrados = useMemo(() => {
        const texto = busqueda.toLowerCase().trim();
        return origenes.filter((origen) => {
            const coincideBusqueda =
                texto === '' ||
                [
                    origen.insumo_nombre,
                    origen.marca,
                    origen.numero_lote_insumo,
                    origen.proveedor_nombre ?? '',
                    origen.proveedor_cuit ?? '',
                    origen.numero_remito ?? '',
                ].some((valor) => valor.toLowerCase().includes(texto));
            const coincideProveedor =
                proveedorFiltro === 'todos' || (origen.proveedor_nombre ?? SIN_PROVEEDOR) === proveedorFiltro;
            return coincideBusqueda && coincideProveedor;
        });
    }, [origenes, busqueda, proveedorFiltro]);

    if (isLoading) return <PageLoading title={TITULO} />;
    if (!data || error) return <PageError
        title={TITULO}
        message="Ocurrió un error al cargar la trazabilidad del lote."
    />;

    const cantidadProveedores = new Set(origenes.map((origen) => origen.proveedor_id ?? SIN_PROVEEDOR)).size;

    const columns: TableColumn<TrazabilidadOrigenInsumo>[] = [
        {
            name: 'Insumo',
            selector: (row) => row.insumo_nombre,
            sortable: true,
            grow: 1.5,
            cell: (row) => <span className="fw-semibold">{row.insumo_nombre}</span>,
        },
        {
            name: 'Marca',
            selector: (row) => row.marca,
            sortable: true,
            center: true,
        },
        {
            name: 'Lote Insumo',
            selector: (row) => row.numero_lote_insumo,
            sortable: true,
            center: true,
        },
        {
            name: 'Vencimiento',
            selector: (row) => formatearFecha(row.fecha_vencimiento),
            sortable: true,
            sortFunction: (a, b) => a.fecha_vencimiento.localeCompare(b.fecha_vencimiento),
            center: true,
        },
        {
            name: 'Cantidad Utilizada',
            selector: (row) => `${Number(row.cantidad_utilizada).toLocaleString('es-AR')} ${row.unidad_medida}`,
            sortable: true,
            sortFunction: (a, b) => Number(a.cantidad_utilizada) - Number(b.cantidad_utilizada),
            center: true,
        },
        {
            name: 'Proveedor',
            selector: (row) => row.proveedor_nombre ?? SIN_PROVEEDOR,
            sortable: true,
            grow: 1.5,
            cell: (row) => (
                <div className="text-start">
                    <div className="fw-semibold">{row.proveedor_nombre ?? SIN_PROVEEDOR}</div>
                    {row.proveedor_cuit && <small className="text-muted">CUIT {row.proveedor_cuit}</small>}
                </div>
            ),
        },
        {
            name: 'Remito',
            selector: (row) => row.numero_remito ?? '-',
            sortable: true,
            center: true,
        },
        {
            name: 'Fecha Recepción',
            selector: (row) => formatearFecha(row.fecha_recepcion),
            sortable: true,
            sortFunction: (a, b) => (a.fecha_recepcion ?? '').localeCompare(b.fecha_recepcion ?? ''),
            center: true,
        },
        {
            name: 'Acciones',
            center: true,
            cell: (row) => (
                <div className="d-flex gap-1">
                    <ActionButton
                        variant="outline-info"
                        size="sm"
                        tooltip="Ver lote de insumo"
                        icon="bi bi-eye"
                        onClick={() => navigate(`/insumos-lote/${row.insumo_lote_id}`)}
                    />
                    {row.lote_proveedor_id && (
                        <ActionButton
                            variant="outline-secondary"
                            size="sm"
                            tooltip="Ver recepción del proveedor"
                            icon="bi bi-truck"
                            onClick={() => navigate(`/recepciones/${row.lote_proveedor_id}`)}
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <Container fluid style={{ maxWidth: '1400px' }}>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="TRAZABILIDAD"
                        title={TITULO}
                        subtitle={`${data.producto_nombre} · Lote #${data.lote_id}`}
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    <Form.Control
                        type="text"
                        placeholder="Buscar insumo, lote, proveedor..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    <ListFilter value={proveedorFiltro} options={opcionesProveedor} onChange={setProveedorFiltro} />
                </Col>
                <Col xs="auto">
                    <ExportMenu
                        title={`Trazabilidad - ${data.producto_nombre} Lote #${data.lote_id} (producido el ${formatearFecha(data.fecha_produccion)})`}
                        filename={`trazabilidad-lote-produccion-${data.lote_id}`}
                        columns={columns.filter((columna) => columna.name !== 'Acciones')}
                        rows={filtrados}
                        orientation="landscape"
                    />
                </Col>
            </Row>

            <Row className="g-2 mb-3 px-2">
                {[
                    { etiqueta: 'Fecha de producción', valor: formatearFecha(data.fecha_produccion), icono: 'bi-calendar-event' },
                    { etiqueta: 'Vencimiento', valor: formatearFecha(data.fecha_vencimiento), icono: 'bi-calendar-x' },
                    { etiqueta: 'Insumos utilizados', valor: String(origenes.length), icono: 'bi-box-seam' },
                    { etiqueta: 'Proveedores', valor: String(cantidadProveedores), icono: 'bi-truck' },
                ].map((dato) => (
                    <Col xs={6} md={3} key={dato.etiqueta}>
                        <Card className="h-100 border-0 shadow-sm">
                            <Card.Body className="py-2 text-start">
                                <small className="text-muted">
                                    <i className={`bi ${dato.icono} me-1`} style={{ color: 'var(--sb-seafoam-primary)' }}></i>
                                    {dato.etiqueta}
                                </small>
                                <div className="fw-bold fs-5">{dato.valor}</div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <AppTable
                columns={columns}
                data={filtrados}
                noDataComponent={
                    <div className="p-4 text-muted">
                        {origenes.length === 0
                            ? 'Este lote todavía no tiene insumos asociados.'
                            : 'No se encontraron resultados.'}
                    </div>
                }
            />

            <div className="mt-3 mb-4">
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left me-1"></i>Volver
                </Button>
            </div>
        </Container>
    );
}
