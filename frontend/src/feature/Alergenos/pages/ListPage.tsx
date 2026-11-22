import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';
import { ActionButton } from '../../../components/ActionButton';
import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi, useAuth } from '../../../hooks';
import { ListFilter } from "../../../components/ListFilter";
import { DeleteAlergenoModal } from '../components/DeleteAlergenoModal';
import type { Alergeno } from '../types';
import { PageLoading } from '../../../components/PageLoading';

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
    const { data: alergenos, error, isLoading } = useApi<Alergeno[]>("/alergenos/");
    const [alergenoToDelete, setAlergenoToDelete] = useState<Alergeno | null>(null);
    const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todos");

    const filteredAlergenos = useMemo(() => {
        if (!Array.isArray(alergenos)) return [];

        return alergenos.filter((alergeno) => {
            const coincideBusqueda =
                alergeno.nombre.toLowerCase().includes(search.toLowerCase()) ||
                (alergeno.descripcion ?? "").toLowerCase().includes(search.toLowerCase());

            const coincideEstado =
                estadoFiltro === "todos" ||
                (estadoFiltro === "activo" && alergeno.activo) ||
                (estadoFiltro === "inactivo" && !alergeno.activo);

            return coincideBusqueda && coincideEstado;
        });
    }, [search, estadoFiltro, alergenos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar por nombre o descripción..."
                className="mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    const titulo = "Alérgenos";

    if (isLoading) return <PageLoading title={titulo} />;

    if (!alergenos || error) return (
        <Container>
            <PageHeader title={titulo} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar los Alérgenos</Alert>
                </Col>
            </Row>
        </Container>
    );

    const columns: TableColumn<Alergeno>[] = [
        {
            name: 'Nombre',
            selector: row => row.nombre,
            sortable: true,
            center: true,
            minWidth: '200px',
        },
        {
            name: 'Descripción',
            selector: row => row.descripcion || '',
            sortable: true,
            center: true,
            minWidth: '260px',
            wrap: true,
            cell: row => (
                <span className={row.descripcion ? "" : "text-muted fst-italic"}>
                    {row.descripcion || "Sin descripción"}
                </span>
            ),
        },
        {
            name: 'Gluten (TACC)',
            selector: row => row.es_tacc ? 'Con TACC' : 'No TACC',
            sortable: true,
            center: true,
            minWidth: '130px',
            cell: row => (
                <div
                    style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        background: row.es_tacc ? '#fef3c7' : '#e0f2fe',
                        color: row.es_tacc ? '#92400e' : '#075985',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {row.es_tacc ? 'Con TACC' : 'Sin TACC'}
                </div>
            ),
        },
        {
            name: 'Estado',
            selector: row => row.activo ? 'Activo' : 'Inactivo',
            sortable: true,
            center: true,
            minWidth: '105px',
            cell: row => (
                <div
                    style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        background: row.activo ? '#dcfce7' : '#fee2e2',
                        color: row.activo ? '#166534' : '#991b1b',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {row.activo ? 'Activo' : 'Inactivo'}
                </div>
            ),
        },
        {
            name: "Acciones",
            center: true,
            minWidth: '140px',
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {currentUser?.administrar && (
                        <>
                            <ActionButton
                                variant="outline-primary"
                                size="sm"
                                tooltip="Editar Datos"
                                icon="bi bi-pencil"
                                disabled={!row.activo}
                                onClick={() => navigate(`/alergenos/${row.id}/edit`)}
                            />
                            <ActionButton
                                variant={row.activo ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                tooltip={row.activo ? 'Dar de baja' : 'Dar de alta'}
                                icon={row.activo ? 'bi-dash-circle' : 'bi-check-circle'}
                                onClick={() => setAlergenoToDelete(row)}
                            />
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="DATOS MAESTROS"
                        title={titulo}
                        subtitle="Revisá el listado de alergenos y sustancias con gluten (TACC) creados hasta la fecha."
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
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
                            size='sm'
                            onClick={() => navigate("/alergenos/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Alérgeno
                        </Button>
                    </Col>
                )}
            </Row>

            <AppTable columns={columns} data={filteredAlergenos} />

            <DeleteAlergenoModal
                alergeno={alergenoToDelete}
                onHide={() => setAlergenoToDelete(null)}
                onDeleted={() => mutate("/alergenos/")}
            />
        </Container>
    );
}