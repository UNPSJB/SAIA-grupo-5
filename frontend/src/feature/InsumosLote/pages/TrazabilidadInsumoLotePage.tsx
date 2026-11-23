import { useMemo, useState } from 'react';
import { Badge, Button, Col, Container, Form, Row } from 'react-bootstrap';
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
import type { TrazabilidadInsumoLoteData } from '../../LotesProduccion/types';

const TITULO = 'Cadena de Trazabilidad Completa (Clientes Alcanzados)';
const SIN_ENVIO = 'Sin envío';

const formatearFecha = (fecha?: string | null) => (fecha ? fecha.split('-').reverse().join('/') : '-');

// Una fila por envío; los lotes de producción sin envíos aparecen igual, con estado "Sin envío"
interface FilaTrazabilidad {
    clave: string;
    lote_produccion_id: number;
    producto_nombre: string;
    fecha_produccion: string;
    estado_lote: string;
    cliente: string;
    cliente_cuit: string;
    direccion: string;
    numero_remito: string;
    fecha_envio: string | null;
    cantidad: number | null;
    estado_envio: string;
}

const colorEstadoEnvio = (estado: string) =>
    estado === 'Entregado' ? 'success' : estado === 'Rechazado' ? 'danger' : estado === SIN_ENVIO ? 'secondary' : 'warning';

export function TrazabilidadInsumoLotePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('todos');

    const { data, isLoading, error } = useApi<TrazabilidadInsumoLoteData>(`/insumos-lote/${id}/trazabilidad`);

    const filas = useMemo<FilaTrazabilidad[]>(() => {
        if (!data) return [];
        return data.producciones.flatMap((produccion): FilaTrazabilidad[] => {
            const base = {
                lote_produccion_id: produccion.lote_produccion_id,
                producto_nombre: produccion.producto_nombre,
                fecha_produccion: produccion.fecha_produccion,
                estado_lote: produccion.estado,
            };
            if (produccion.envios.length === 0) {
                return [{
                    ...base,
                    clave: `lote-${produccion.lote_produccion_id}`,
                    cliente: '-',
                    cliente_cuit: '',
                    direccion: '-',
                    numero_remito: '-',
                    fecha_envio: null,
                    cantidad: null,
                    estado_envio: SIN_ENVIO,
                }];
            }
            return produccion.envios.map((envio) => ({
                ...base,
                clave: `envio-${envio.envio_id}`,
                cliente: envio.cliente_razon_social,
                cliente_cuit: envio.cliente_cuit,
                direccion: envio.direccion,
                numero_remito: envio.numero_remito,
                fecha_envio: envio.fecha_envio,
                cantidad: envio.cantidad,
                estado_envio: envio.estado,
            }));
        });
    }, [data]);

    // Las opciones del filtro salen de los estados de envío presentes en los datos
    const opcionesEstado = useMemo(() => {
        const opciones: Record<string, string> = { todos: 'Todos' };
        filas.forEach((fila) => { opciones[fila.estado_envio] = fila.estado_envio; });
        return opciones;
    }, [filas]);

    const filtradas = useMemo(() => {
        const texto = busqueda.toLowerCase().trim();
        return filas.filter((fila) => {
            const coincideBusqueda =
                texto === '' ||
                [
                    `lote #${fila.lote_produccion_id}`,
                    fila.producto_nombre,
                    fila.cliente,
                    fila.cliente_cuit,
                    fila.direccion,
                    fila.numero_remito,
                ].some((valor) => valor.toLowerCase().includes(texto));
            const coincideEstado = estadoFiltro === 'todos' || fila.estado_envio === estadoFiltro;
            return coincideBusqueda && coincideEstado;
        });
    }, [filas, busqueda, estadoFiltro]);

    if (isLoading) return <PageLoading title={TITULO} />;
    if (!data || error) return <PageError title={TITULO} message="Ocurrió un error al cargar la trazabilidad." />;

    const columns: TableColumn<FilaTrazabilidad>[] = [
        {
            name: 'Lote de Producción',
            selector: (row) => `Lote #${row.lote_produccion_id}`,
            sortable: true,
            sortFunction: (a, b) => a.lote_produccion_id - b.lote_produccion_id,
            center: true,
            cell: (row) => <strong>Lote #{row.lote_produccion_id}</strong>,
        },
        {
            name: 'Producto',
            selector: (row) => row.producto_nombre,
            sortable: true,
            center: true,
            grow: 1.5,
        },
        {
            name: 'Fecha Producción',
            selector: (row) => formatearFecha(row.fecha_produccion),
            sortable: true,
            sortFunction: (a, b) => a.fecha_produccion.localeCompare(b.fecha_produccion),
            center: true,
        },
        {
            name: 'Cliente',
            selector: (row) => row.cliente,
            sortable: true,
            center: true,
            grow: 1.5,
            cell: (row) => <span className="fw-semibold">{row.cliente}</span>,
        },
        {
            name: 'Dirección',
            selector: (row) => row.direccion,
            sortable: true,
            center: true,
            grow: 1.5,
        },
        {
            name: 'Remito',
            selector: (row) => row.numero_remito,
            sortable: true,
            center: true,
        },
        {
            name: 'Fecha Envío',
            selector: (row) => formatearFecha(row.fecha_envio),
            sortable: true,
            sortFunction: (a, b) => (a.fecha_envio ?? '').localeCompare(b.fecha_envio ?? ''),
            center: true,
        },
        {
            name: 'Cantidad',
            selector: (row) => (row.cantidad !== null ? `${row.cantidad} u.` : '-'),
            sortable: true,
            sortFunction: (a, b) => (a.cantidad ?? 0) - (b.cantidad ?? 0),
            center: true,
        },
        {
            name: 'Estado Envío',
            selector: (row) => row.estado_envio,
            sortable: true,
            center: true,
            cell: (row) => <Badge bg={colorEstadoEnvio(row.estado_envio)}>{row.estado_envio}</Badge>,
        },
        {
            name: 'Acción',
            center: true,
            cell: (row) => (
                <ActionButton
                    variant="outline-info"
                    size="sm"
                    tooltip="Ver lote de producción"
                    icon="bi bi-eye"
                    onClick={() => navigate(`/lotes-produccion/${row.lote_produccion_id}`)}
                />
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
                        subtitle={`${data.insumo_nombre} (${data.marca}) · Lote ${data.numero_lote_insumo}`}
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    <Form.Control
                        type="text"
                        placeholder="Buscar cliente, remito, producto..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    <ListFilter value={estadoFiltro} options={opcionesEstado} onChange={setEstadoFiltro} />
                </Col>
                <Col xs="auto">
                    <ExportMenu
                        title={`Trazabilidad - ${data.insumo_nombre} Lote ${data.numero_lote_insumo}`}
                        filename={`trazabilidad-insumo-lote-${data.insumo_lote_id}`}
                        columns={columns}
                        rows={filtradas}
                        orientation="landscape"
                    />
                </Col>
            </Row>

            <AppTable
                columns={columns}
                data={filtradas}
                noDataComponent={
                    <div className="p-4 text-muted">
                        {filas.length === 0
                            ? 'Este insumo aún no fue utilizado en producción ni llegó a clientes.'
                            : 'No se encontraron resultados.'}
                    </div>
                }
            />

            <div className="mt-3 mb-4">
                <Button variant="outline-secondary" onClick={() => navigate(`/insumos-lote/${data.insumo_lote_id}`)}>
                    <i className="bi bi-arrow-left me-1"></i>Volver al insumo
                </Button>
            </div>
        </Container>
    );
}
