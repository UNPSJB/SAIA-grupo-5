import { useState, useMemo } from "react";
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';

import { DeletePlanLimpiezaModal } from '../components/DeletePlanLimpiezaModal';
import { VerDescripcionModal } from '../components/VerDescripcionModal';
import type { PlanLimpieza } from "../types";

export function PlanesLimpiezaPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { data: planes, error, isLoading } = useApi<PlanLimpieza[]>("/planes-limpieza/")
    const [planToDelete, setPlanToDelete] = useState<PlanLimpieza | null>(null);
    const [planDescripcion, setPlanDescripcion] = useState<PlanLimpieza | null>(null);

    const encabezadoTareas = (label: string) => (
        <div className="text-center lh-sm">
            <div className="fw-bold">Tareas</div>
            <div>{label}</div>
        </div>
    );

    const columns = useMemo<TableColumn<PlanLimpieza>[]>(() => [
        {
            id: "nombre",
            name: "Nombre",
            selector: row => row.nombre,
            sortable: true,
            minWidth: '220px',
            grow: 3,
        },
        {
            id: "descripcion",
            name: "Descripción",
            center: true,
            cell: row => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setPlanDescripcion(row)}
                >
                    <i className="bi bi-eye me-1"></i>Ver
                </Button>
            ),
        },
        {
            name: encabezadoTareas("Todas"),
            center: true,
            cell: row => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate(`/tareas?plan_id=${row.id}`)}
                >
                    <i className="bi bi-eye me-1"></i>Ver
                </Button>
            ),
        },
        {
            name: encabezadoTareas("Sector"),
            center: true,
            cell: row => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate(`/tareas?plan_id=${row.id}&relacion=sector`)}
                >
                    <i className="bi bi-eye me-1"></i>Ver
                </Button>
            ),
        },
        {
            name: encabezadoTareas("Superficies"),
            center: true,
            cell: row => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate(`/tareas?plan_id=${row.id}&relacion=superficie`)}
                >
                    <i className="bi bi-eye me-1"></i>Ver
                </Button>
            ),
        },
        {
            name: encabezadoTareas("Equipo"),
            center: true,
            cell: row => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate(`/tareas?plan_id=${row.id}&relacion=equipo`)}
                >
                    <i className="bi bi-eye me-1"></i>Ver
                </Button>
            ),
        },
        {
            id: "estado",
            name: 'Estado',
            selector: row => row.activo ? 'Activo' : 'Inactivo',
            sortable: true,
            center: true,
            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                </div>
            )
        },
        {
            id: "acciones",
            name: "Acciones",
            center: true,
            minWidth: "220px",
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/planes-limpieza/${row.id}/edit`)}
                    >
                        <i className="bi bi-pencil me-1"></i>Editar
                    </Button>
                    {row.activo && (
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => setPlanToDelete(row)}
                        >
                            <i className="bi bi-trash3 me-1"></i>Eliminar
                        </Button>
                    )}
                </div>
            )
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- navigate y los setState son referencias estables
    ], []);

    const filteredPlanes = useMemo(() => {
        if (!Array.isArray(planes)) return [];
        return (planes ?? []).filter((plan) => {
            return plan.nombre.toLowerCase().includes(search.toLowerCase());
        });
    }, [search, planes]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar plan de limpieza..."
                className=" mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, [search]);

    if (isLoading) return (
        <>
            <PageHeader title="Listado de Planes de Limpieza" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (!planes || error) return (
        <Container>
            <PageHeader title="Listado de Planes de Limpieza" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar los Planes de Limpieza</Alert>
                </Col>
            </Row>
        </Container>
    )

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader title="Listado de Planes de Limpieza" />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                <Col xs="auto" className="d-flex justify-content-end">
                    <Button
                        variant="primary"
                        size='sm'
                        onClick={() => navigate("/planes-limpieza/new")}
                        style={{ whiteSpace: "nowrap" }}
                    >
                        + Nuevo Plan de Limpieza
                    </Button>
                </Col>
            </Row>
            <AppTable columns={columns} data={filteredPlanes} />
            <DeletePlanLimpiezaModal
                plan={planToDelete}
                onHide={() => setPlanToDelete(null)}
                onDeleted={() => mutate("/planes-limpieza/")}
            />
            <VerDescripcionModal
                plan={planDescripcion}
                onHide={() => setPlanDescripcion(null)}
            />
        </Container>
    );
}
