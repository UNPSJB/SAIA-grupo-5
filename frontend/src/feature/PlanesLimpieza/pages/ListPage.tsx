import { useState, useMemo } from "react";
import { mutate } from 'swr';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { PageError } from '../../../components/PageError';
import { ActionButton } from '../../../components/ActionButton';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../libs/axios';

import { DeletePlanLimpiezaModal } from '../components/DeletePlanLimpiezaModal';
import { VerDescripcionModal } from '../components/VerDescripcionModal';
import type { PlanLimpieza } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function PlanesLimpiezaPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: planes, error, isLoading } = useApi<PlanLimpieza[]>("/planes-limpieza/")
    const [planToDelete, setPlanToDelete] = useState<PlanLimpieza | null>(null);
    const [planDescripcion, setPlanDescripcion] = useState<PlanLimpieza | null>(null);

    const cambiarEstado = async (plan: PlanLimpieza) => {
        try {
            await api.put(`/planes-limpieza/${plan.id}/estado`);
            mostrarAlertaExito("El plan de limpieza se dio de alta correctamente.") // ESTO ES PROVISORIO
            await mutate("/planes-limpieza/");
        } catch (err: any) {
            const detail = err.response?.data?.detail || `No se pudo ${plan.activo ? 'dar de baja' : 'dar de alta'} el plan de limpieza.`;
            mostrarAlertaError(detail)
            console.log(err);
        }
    };

    const baseColumns = useMemo<TableColumn<PlanLimpieza>[]>(() => [
        {
            id: "nombre",
            name: "Nombre",
            selector: row => row.nombre,
            sortable: true,
            center: true,
            minWidth: '220px',
            grow: 1.5,
        },
        {
            id: "descripcion",
            name: "Descripción",
            center: true,
            cell: row => (
                <Button
                    variant="outline-info"
                    size="sm"
                    onClick={() => setPlanDescripcion(row)}
                >
                    <i className="bi bi-eye me-1"></i>Ver
                </Button>
            ),
        },
        {
            name: "Tareas", // Le ponemos el nombre directo acá
            center: true,
            cell: row => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={!row.activo}
                    onClick={() => navigate(`/tareas?plan_id=${row.id}`)}
                >
                    <i className="bi bi-box-arrow-up-right"></i> Ver
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
    ], [navigate]);

    const columns: TableColumn<PlanLimpieza>[] = currentUser?.administrar
        ? [
            ...baseColumns,
            {
                id: "acciones",
                name: "Acciones",
                center: true,
                minWidth: "220px",
                cell: (row) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ActionButton
                            variant="outline-primary"
                            size="sm"
                            tooltip="Editar"
                            icon="bi-pencil"
                            disabled={!row.activo}
                            onClick={() => navigate(`/planes-limpieza/${row.id}/edit`)}
                        />
                        {row.activo ? (
                            <ActionButton
                                variant="outline-danger"
                                size="sm"
                                tooltip="Dar de baja"
                                icon="bi-dash-circle"
                                onClick={() => setPlanToDelete(row)}
                            />
                        ) : (
                            <ActionButton
                                variant="outline-success"
                                size="sm"
                                tooltip="Dar de alta"
                                icon="bi-check-circle"
                                onClick={() => cambiarEstado(row)}
                            />
                        )}
                    </div>
                )
            }
        ]
        : baseColumns;

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

    if (isLoading) return <PageLoading title="Listado de Planes de Limpieza" />;
    if (!planes || error) return (
        <PageError title="Listado de Planes de Limpieza" message="Ocurrió un error al cargar los Planes de Limpieza" />
    );

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="GESTIÓN"
                        title="Listado de Planes de Limpieza"
                        subtitle="Revisá los Planes de Limpieza y crea nuevos."
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                {currentUser?.administrar && (
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
                )}
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
