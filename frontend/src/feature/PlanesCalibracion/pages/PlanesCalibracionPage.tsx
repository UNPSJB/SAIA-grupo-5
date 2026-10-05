import { useMemo, useState } from "react";
import { mutate } from "swr";
import { useAuth } from "../../../hooks/useAuth";
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { type TableColumn } from "react-data-table-component";
import { AppTable } from "../../../components/AppTable";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import { EstadoPlanCalibracionModal } from "../components/EstadoPlanCalibracionModal";
import type { PlanCalibracion } from "../types";
import type { Equipo } from "../../Equipos/types";


export function PlanesCalibracionPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState("");
    const [planToDelete, setPlanToDelete] = useState<PlanCalibracion | null>(null);

    const { data: planes, error, isLoading } = useApi<PlanCalibracion[]>("/planes-calibracion");
    const { data: equipos } = useApi<Equipo[]>("/equipos");

    const obtenerEquipo = (equipoId: number) => {
        return equipos?.find((equipo) => equipo.id === equipoId);
    };

    const obtenerNombreEquipo = (equipoId: number) => {
        return obtenerEquipo(equipoId)?.nombre ?? "Equipo no encontrado";
    };

    const filteredPlanes = useMemo(() => {
        if (!Array.isArray(planes)) return [];

        const busqueda = search.toLowerCase();

        return planes.filter((plan) => {
            const nombreEquipo = obtenerNombreEquipo(plan.equipo_id);

            return (
                nombreEquipo.toLowerCase().includes(busqueda) ||
                plan.fecha_inicio.includes(busqueda) ||
                plan.periodicidad.toString().includes(busqueda)
            );
        });
    }, [search, planes, equipos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar plan..."
                className="mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    if (isLoading) return (
        <>
            <PageHeader title="Planes de Calibración" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    );

    if (!planes || error) return (
        <Container>
            <PageHeader title="Planes de Calibración" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">
                        Ocurrió un error al cargar los planes de calibración
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    const columns: TableColumn<PlanCalibracion>[] = [
        {
            name: "Equipo",
            selector: row => obtenerNombreEquipo(row.equipo_id),
            sortable: true,
            center: true,
            grow: 2,
            minWidth: "180px",
        },
        {
            name: "Fecha de Inicio",
            selector: row => row.fecha_inicio,
            sortable: true,
            center: true,
            minWidth: "140px",
        },
        {
            name: "Periodicidad",
            selector: row => row.periodicidad,
            sortable: true,
            center: true,
            minWidth: "130px",
            cell: row => (
                <span>
                    {row.periodicidad} {row.periodicidad === 1 ? "día" : "días"}
                </span>
            ),
        },
        {
            name: "Próxima Calibración",
            selector: row => row.proxima_fecha ?? "",
            sortable: true,
            center: true,
            minWidth: "170px",
            cell: row => (
                <span>{row.proxima_fecha ?? "Sin definir"}</span>
            ),
        },
        {
            name: "Días para Calibración",
            sortable: true,
            center: true,
            minWidth: "190px",
            selector: row => row.dias_restantes ?? 999999,
            cell: row => {
                if (row.dias_restantes === null) {
                    return <span>Sin definir</span>;
                }

                if (row.dias_restantes < 0) {
                    return (
                        <div
                            style={{
                                padding: "4px 12px",
                                borderRadius: "16px",
                                background: "#fef3c7",
                                color: "#92400e",
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                            }}
                        >
                            Vencido
                        </div>
                    );
                }

                if (row.dias_restantes === 0) {
                    return <span>Calibración hoy</span>;
                }

                if (row.dias_restantes === 1) {
                    return <span>{row.dias_restantes} día</span>;
                }

                return <span>{row.dias_restantes} días</span>;
            },
        },
        {
            name: "Estado",
            selector: row => row.estado ? "Activo" : "Inactivo",
            sortable: true,
            center: true,
            cell: row => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{
                            padding: "4px 12px",
                            borderRadius: "16px",
                            background: row.estado ? "#dcfce7" : "#fee2e2",
                            color: row.estado ? "#166534" : "#991b1b",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {row.estado ? "Activo" : "Inactivo"}
                    </div>
                </div>
            ),
        },
        {
            name: "Acciones",
            center: true,
            minWidth: "180px",
            cell: row => (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {currentUser?.administrar && (
                        <>
                            {row.estado && (
                                <>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        title="Editar"
                                        onClick={() => navigate(`/planes-calibracion/${row.id}/edit`)}
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </Button>

                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        title="Registrar calibración"
                                        onClick={() => {}}
                                    >
                                        <i className="bi bi-tools"></i>
                                    </Button>
                                </>
                            )}

                            <Button
                                variant={row.estado ? "outline-danger" : "outline-success"}
                                size="sm"
                                title={row.estado ? "Dar de baja" : "Dar de alta"}
                                onClick={() => setPlanToDelete(row)}
                            >
                                <i className={`bi ${row.estado ? "bi-trash3" : "bi-check-circle"}`}></i>
                            </Button>
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
                    <PageHeader title="Planes de Calibración" />
                </Col>

                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>

                {currentUser?.administrar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate("/planes-calibracion/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Plan
                        </Button>
                    </Col>
                )}
            </Row>

            <AppTable
                columns={columns}
                data={filteredPlanes}
            />

            <EstadoPlanCalibracionModal
                planCalibracion={planToDelete}
                onHide={() => setPlanToDelete(null)}
                onDeleted={() => mutate("/planes-calibracion")}
            />
        </Container>
    );
}