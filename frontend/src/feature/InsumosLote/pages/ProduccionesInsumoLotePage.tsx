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
import type { InsumoLote, ProduccionAsociada } from '../types';

const TITULO = 'Lotes de Producción Asociados';

const formatearFecha = (fecha?: string | null) => (fecha ? fecha.split('-').reverse().join('/') : '-');

export function ProduccionesInsumoLotePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('todos');

    const { data: item, isLoading, error } = useApi<InsumoLote>(`/insumos-lote/${id}`);
    const producciones = useMemo(() => item?.producciones_asociadas ?? [], [item]);

    // Las opciones del filtro salen de los estados presentes en los datos
    const opcionesEstado = useMemo(() => {
        const opciones: Record<string, string> = { todos: 'Todos' };
        producciones.forEach((asoc) => { opciones[asoc.lote_produccion.estado] = asoc.lote_produccion.estado; });
        return opciones;
    }, [producciones]);

    const filtradas = useMemo(() => {
        const texto = busqueda.toLowerCase().trim();
        return producciones.filter((asoc) => {
            const coincideBusqueda =
                texto === '' ||
                `lote #${asoc.lote_produccion.id}`.includes(texto) ||
                formatearFecha(asoc.lote_produccion.fecha_produccion).includes(texto);
            const coincideEstado = estadoFiltro === 'todos' || asoc.lote_produccion.estado === estadoFiltro;
            return coincideBusqueda && coincideEstado;
        });
    }, [producciones, busqueda, estadoFiltro]);

    if (isLoading) return <PageLoading title={TITULO} />;
    if (!item || error) return <PageError title={TITULO} message="Ocurrió un error al cargar el insumo." />;

    const unidad = item.insumo.unidad_medida?.nombre || 'U';

    const columns: TableColumn<ProduccionAsociada>[] = [
        {
            name: 'Lote de Producción',
            selector: (row) => `Lote #${row.lote_produccion.id}`,
            sortable: true,
            sortFunction: (a, b) => a.lote_produccion.id - b.lote_produccion.id,
            center: true,
            cell: (row) => <strong>Lote #{row.lote_produccion.id}</strong>,
        },
        {
            name: 'Fecha Fabricación',
            selector: (row) => formatearFecha(row.lote_produccion.fecha_produccion),
            sortable: true,
            sortFunction: (a, b) => a.lote_produccion.fecha_produccion.localeCompare(b.lote_produccion.fecha_produccion),
            center: true,
        },
        {
            name: 'Cantidad Utilizada',
            selector: (row) => `${Number(row.cantidad_utilizada).toLocaleString('es-AR')} ${unidad}`,
            sortable: true,
            sortFunction: (a, b) => Number(a.cantidad_utilizada) - Number(b.cantidad_utilizada),
            center: true,
        },
        {
            name: 'Estado del Lote',
            selector: (row) => row.lote_produccion.estado,
            sortable: true,
            center: true,
            cell: (row) => <Badge bg="secondary">{row.lote_produccion.estado}</Badge>,
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
                    onClick={() => navigate(`/lotes-produccion/${row.lote_produccion.id}`)}
                />
            ),
        },
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="TRAZABILIDAD"
                        title={TITULO}
                        subtitle={`${item.insumo.nombre} (${item.marca}) · Lote ${item.numero_lote}`}
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    <Form.Control
                        type="text"
                        placeholder="Buscar lote o fecha..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    <ListFilter value={estadoFiltro} options={opcionesEstado} onChange={setEstadoFiltro} />
                </Col>
                <Col xs="auto">
                    <ExportMenu
                        title={`${TITULO} - ${item.insumo.nombre} Lote ${item.numero_lote}`}
                        filename={`producciones-insumo-lote-${item.id}`}
                        columns={columns}
                        rows={filtradas}
                    />
                </Col>
            </Row>

            <AppTable
                columns={columns}
                data={filtradas}
                noDataComponent={
                    <div className="p-4 text-muted">
                        {producciones.length === 0
                            ? 'Este insumo todavía no fue utilizado en ningún lote de producción.'
                            : 'No se encontraron resultados.'}
                    </div>
                }
            />

            <div className="mt-3 mb-4">
                <Button variant="outline-secondary" onClick={() => navigate(`/insumos-lote/${item.id}`)}>
                    <i className="bi bi-arrow-left me-1"></i>Volver al insumo
                </Button>
            </div>
        </Container>
    );
}
