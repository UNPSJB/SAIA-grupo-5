import { useMemo, useState } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';
import { PageLoading } from '../../../components/PageLoading';
import { ActionButton } from '../../../components/ActionButton';
import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { ListFilter } from '../../../components/ListFilter';
import { EstadoBadge } from '../../../components/EstadoBadge';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import { DeleteAditivoModal } from '../components/DeleteAditivoModal';
import type { Aditivo } from '../types';

type EstadoFiltro = "todos" | "activo" | "inactivo";

const ESTADO_FILTRO_LABELS: Record<EstadoFiltro, string> = {
    todos: "Todos",
    activo: "Activos",
    inactivo: "Inactivos",
};

export function ListPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todos");
    const [aditivoToDelete, setAditivoToDelete] = useState<Aditivo | null>(null);
    const { data: aditivos, error, isLoading } = useApi<Aditivo[]>("/aditivos/");

    const aditivosFiltrados = useMemo(() => {
        if (!Array.isArray(aditivos)) return [];
        const busqueda = search.toLowerCase().trim();

        return aditivos.filter((aditivo) => {
            const coincideBusqueda = [aditivo.nombre, aditivo.clase_funcional, aditivo.numero_ins ?? ""]
                .some((texto) => texto.toLowerCase().includes(busqueda));
            const coincideEstado =
                estadoFiltro === "todos" ||
                (estadoFiltro === "activo" && aditivo.activo) ||
                (estadoFiltro === "inactivo" && !aditivo.activo);
            return coincideBusqueda && coincideEstado;
        });
    }, [search, estadoFiltro, aditivos]);

    const tituloPagina = "Listado de Aditivos";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!aditivos || error) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar los aditivos</Alert>
                </Col>
            </Row>
        </Container>
    );

    const columns: TableColumn<Aditivo>[] = [
        {
            name: 'Clase funcional',
            selector: row => row.clase_funcional,
            sortable: true,
            minWidth: '160px',
        },
        {
            name: 'Nombre',
            selector: row => row.nombre,
            sortable: true,
            minWidth: '200px',
        },
        {
            name: 'Número INS',
            selector: row => row.numero_ins ?? '-',
            sortable: true,
            center: true,
        },
        {
            name: 'Estado',
            selector: row => row.activo ? 'Activo' : 'Inactivo',
            sortable: true,
            center: true,
            cell: row => (
                <EstadoBadge tono={row.activo ? 'success' : 'danger'} icono={row.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}>
                    {row.activo ? 'Activo' : 'Inactivo'}
                </EstadoBadge>
            ),
        },
        ...(currentUser?.administrar ? [{
            name: 'Acciones',
            center: true,
            cell: (row: Aditivo) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ActionButton
                        variant="outline-primary"
                        size="sm"
                        tooltip="Editar"
                        icon="bi bi-pencil"
                        disabled={!row.activo}
                        onClick={() => navigate(`/aditivos/${row.id}/edit`)}
                    />
                    <ActionButton
                        variant={row.activo ? 'outline-danger' : 'outline-success'}
                        size="sm"
                        tooltip={row.activo ? 'Dar de baja' : 'Dar de alta'}
                        icon={row.activo ? 'bi-dash-circle' : 'bi-check-circle'}
                        onClick={() => setAditivoToDelete(row)}
                    />
                </div>
            ),
        }] : []),
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="DATOS MAESTROS"
                        title={tituloPagina}
                        subtitle="Lista de referencia de aditivos alimentarios que pueden usarse en las recetas."
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    <Form.Control
                        type="text"
                        placeholder="Buscar aditivo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    <ListFilter
                        value={estadoFiltro}
                        options={ESTADO_FILTRO_LABELS}
                        onChange={(value) => setEstadoFiltro(value as EstadoFiltro)}
                    />
                </Col>
                {currentUser?.administrar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate("/aditivos/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Aditivo
                        </Button>
                    </Col>
                )}
            </Row>
            <AppTable columns={columns} data={aditivosFiltrados} />
            <DeleteAditivoModal
                aditivo={aditivoToDelete}
                onHide={() => setAditivoToDelete(null)}
                onDeleted={() => mutate("/aditivos/")}
            />
        </Container>
    );
}
