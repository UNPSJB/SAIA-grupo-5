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
import { VerSectoresModal } from '../components/VerSectoresModal';
import { VerSuperficiesModal } from '../components/VerSuperficiesModal';
import { VerEquiposModal } from '../components/VerEquiposModal';
import type { PlanLimpieza } from "../types";

export function PlanesLimpiezaPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { data: planes, error, isLoading } = useApi<PlanLimpieza[]>("/planes-limpieza/")
    const [planToDelete, setPlanToDelete] = useState<PlanLimpieza | null>(null);
    const [planDescripcion, setPlanDescripcion] = useState<PlanLimpieza | null>(null);
    const [planSectores, setPlanSectores] = useState<PlanLimpieza | null>(null);
    const [planSuperficies, setPlanSuperficies] = useState<PlanLimpieza | null>(null);
    const [planEquipos, setPlanEquipos] = useState<PlanLimpieza | null>(null);

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

    const columns: TableColumn<PlanLimpieza>[] = [
        {
            name: "ID",
            selector: row => row.id,
            sortable: true,
            center: true,
            maxWidth: '80px',
        },
        {
            name: "Nombre",
            selector: row => row.nombre,
            sortable: true,
            minWidth: '220px',
            grow: 3,
        },
        {
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
            name: "Superficies",
            center: true,
            cell: row => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setPlanSuperficies(row)}
                >
                    <i className="bi bi-eye me-1"></i>Ver
                </Button>
            ),
        },
        {
            name: "Sectores",
            center: true,
            cell: row => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setPlanSectores(row)}
                >
                    <i className="bi bi-eye me-1"></i>Ver
                </Button>
            ),
        },
        {
            name: "Equipos",
            center: true,
            cell: row => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setPlanEquipos(row)}
                >
                    <i className="bi bi-eye me-1"></i>Ver
                </Button>
            ),
        },
        {
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
    ];

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
            <VerSectoresModal
                plan={planSectores}
                onHide={() => setPlanSectores(null)}
            />
            <VerSuperficiesModal
                plan={planSuperficies}
                onHide={() => setPlanSuperficies(null)}
            />
            <VerEquiposModal
                plan={planEquipos}
                onHide={() => setPlanEquipos(null)}
            />
        </Container>
    );
}
