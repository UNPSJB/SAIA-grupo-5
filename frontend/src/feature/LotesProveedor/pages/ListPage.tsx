import { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';
import { ActionButton } from '../../../components/ActionButton';
import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi, useAuth } from '../../../hooks';
import { ListFilter } from "../../../components/ListFilter";
import { AvanzarEtapaLoteProveedorModal } from '../componets/AvanzarEtapaLoteProveedorModal';
import { DeleteLoteProveedorModal } from '../componets/DeleteLoteProveedorModal';
import type { LoteProveedor, EstadoLoteProveedor } from '../types';
import { PageLoading } from '../../../components/PageLoading';

type EstadoFiltro = "todos" | "activo" | "inactivo";

const ESTADO_FILTRO_LABELS: Record<EstadoFiltro, string> = {
    todos: "Todos",
    activo: "Activos",
    inactivo: "Inactivos",
};

const ESTILOS_ETAPA: Record<EstadoLoteProveedor, { label: string; bg: string; color: string }> = {
    llegada: { label: "Llegada", bg: "#e0f2fe", color: "#0369a1" },
    desempaque: { label: "Desempaque", bg: "#fef3c7", color: "#92400e" },
    acomodado: { label: "Acomodado", bg: "#dcfce7", color: "#166534" },
};

export function ListPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: lotes, error, isLoading } = useApi<LoteProveedor[]>("/lotes-proveedor/");
    const [loteToAvanzar, setLoteToAvanzar] = useState<LoteProveedor | null>(null);
    const [loteToDelete, setLoteToDelete] = useState<LoteProveedor | null>(null);
    const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todos");

    const filteredLotes = useMemo(() => {
        if (!Array.isArray(lotes)) return [];
        return lotes.filter((l) => {
            const busqueda = search.toLowerCase();
            const coincide =
                l.numero_lote.toLowerCase().includes(busqueda) ||
                (l.numero_remito && l.numero_remito.toLowerCase().includes(busqueda)) ||
                (l.proveedor && l.proveedor.nombre.toLowerCase().includes(busqueda));

            const coincideEstado =
                estadoFiltro === "todos" ||
                (estadoFiltro === "activo" && l.activo) ||
                (estadoFiltro === "inactivo" && !l.activo);

            return coincide && coincideEstado;
        });
    }, [search, estadoFiltro, lotes]);

    const titulo = "Recepciones"

    if (isLoading) return <PageLoading title={titulo} />

    if (!lotes || error) return (
        <Container>
            <PageHeader title={titulo} />
            <Row className="justify-content-center">
                <Col md={6}><Alert variant="danger">Error al cargar las recepciones.</Alert></Col>
            </Row>
        </Container>
    );

    const columns: TableColumn<LoteProveedor>[] = [
        {
            name: 'N° Lote',
            selector: row => row.numero_lote,
            sortable: true,
            center: true,
            minWidth: '150px',
            cell: row => <span className="fw-bold">{row.numero_lote}</span>,
        },
        {
            name: 'Proveedor',
            selector: row => row.proveedor?.nombre || '',
            sortable: true,
            center: true,
            minWidth: '200px',
            cell: row => row.proveedor?.nombre || <span className="text-muted fst-italic">Sin asignar</span>,
        },
        {
            name: 'Remito',
            selector: row => row.numero_remito || '',
            sortable: true,
            center: true,
            minWidth: '140px',
            cell: row => row.numero_remito || <span className="text-muted fst-italic">-</span>,
        },
        {
            name: 'Fecha Recepcion',
            selector: row => row.fecha_recepcion.split("-").reverse().join("/"),
            sortable: true,
            center: true,
            minWidth: '140px',
        },
        {
            name: 'Etapa',
            center: true,
            minWidth: '140px',
            cell: row => {
                const conf = ESTILOS_ETAPA[row.estado] || { label: row.estado, bg: '#f1f5f9', color: '#475569' };
                return (
                    <div style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        background: conf.bg,
                        color: conf.color,
                        fontWeight: 700,
                        fontSize: '0.85rem'
                    }}>
                        {conf.label}
                    </div>
                );
            }
        },
        {
            name: 'Estado',
            selector: row => row.activo ? 'Activo' : 'Inactivo',
            sortable: true,
            center: true,
            minWidth: '110px',
            cell: row => (
                <div style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    background: row.activo ? '#dcfce7' : '#fee2e2',
                    color: row.activo ? '#166534' : '#991b1b',
                    fontWeight: 700,
                }}>
                    {row.activo ? 'Activo' : 'Inactivo'}
                </div>
            )
        },
        {
            name: 'Acciones',
            center: true,
            minWidth: '220px',
            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ActionButton
                        variant="outline-info"
                        size="sm"
                        tooltip="Ver detalle y trazabilidad"
                        icon="bi bi-eye"
                        onClick={() => navigate(`/recepciones/${row.id}`)}
                    />
                    {currentUser?.operar && row.activo && row.estado !== 'acomodado' && (
                        <ActionButton
                            variant="outline-success"
                            size="sm"
                            tooltip={`Avanzar a ${row.estado === 'llegada' ? 'Desempaque' : 'Acomodado'}`}
                            icon="bi bi-arrow-right-circle"
                            onClick={() => setLoteToAvanzar(row)}
                        />
                    )}
                    {currentUser?.administrar && (
                        <>
                            <ActionButton
                                variant="outline-primary"
                                size="sm"
                                tooltip="Editar lote"
                                icon="bi bi-pencil"
                                disabled={!row.activo}
                                onClick={() => navigate(`/recepciones/${row.id}/edit`)}
                            />
                            <ActionButton
                                variant={row.activo ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                tooltip={row.activo ? 'Dar de baja' : 'Dar de alta'}
                                icon={row.activo ? 'bi-dash-circle' : 'bi-check-circle'}
                                onClick={() => setLoteToDelete(row)}
                            />
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="ABASTECIMIENTO"
                        title="Recepciones"
                        subtitle="Recepcion, control de desempaque y almacenamiento en planta."
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    <Form.Control
                        type="text"
                        placeholder="Buscar por lote, remito o proveedor..."
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    <ListFilter
                        value={estadoFiltro}
                        options={ESTADO_FILTRO_LABELS}
                        onChange={(val) => setEstadoFiltro(val as EstadoFiltro)}
                    />
                </Col>
                {currentUser?.operar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button variant="primary" size="sm" onClick={() => navigate('/recepciones/new')}>
                            + Nueva Recepcion
                        </Button>
                    </Col>
                )}
            </Row>

            <AppTable columns={columns} data={filteredLotes} />

            <AvanzarEtapaLoteProveedorModal
                lote={loteToAvanzar}
                onHide={() => setLoteToAvanzar(null)}
                onAvanzado={() => mutate("/lotes-proveedor/")}
            />

            <DeleteLoteProveedorModal
                lote={loteToDelete}
                onHide={() => setLoteToDelete(null)}
                onDeleted={() => mutate("/lotes-proveedor/")}
            />
        </Container>
    );
}