import { useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { type ConditionalStyles, type TableColumn } from "react-data-table-component";

import { AppTable } from "../../../components/AppTable";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import { PRIORIDAD_LABELS, PRIORIDAD_VARIANTS, type Prioridad } from "../../Tareas/types";

import {
    ESTADO_HISTORIAL_VARIANTS,
    getEstadoHistorial,
    type TareaOcurrencia,
} from "../types";

function formatearFecha(fecha: string | null): string {
    if (!fecha) return "-";
    return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-AR");
}

function toISODate(fecha: Date): string {
    return fecha.toISOString().slice(0, 10);
}

export function HistorialPage() {
    const hoy = useMemo(() => new Date(), []);
    const hace7dias = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d;
    }, []);

    const [fechaHasta, setFechaHasta] = useState(toISODate(hoy));
    const [fechaDesde, setFechaDesde] = useState(toISODate(hace7dias));
    const [soloIncumplidas, setSoloIncumplidas] = useState(false);

    const rangoValido = Boolean(fechaDesde) && Boolean(fechaHasta) && fechaDesde <= fechaHasta;

    const url = rangoValido
        ? `/tareas-ocurrencia/historial?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`
        : null;

    const { data: historial, error, isLoading } = useApi<TareaOcurrencia[]>(url);

    const { total, completadas, incumplidas, porcentajeCumplimiento } = useMemo(() => {
        const lista = historial ?? [];
        const totalOcurrencias = lista.length;
        const completadasList = lista.filter((oc) => oc.estado === "Completada");
        const incumplidasList = lista
            .filter((oc) => getEstadoHistorial(oc) === "Incumplida")
            .sort((a, b) => a.fecha.localeCompare(b.fecha));

        const resueltas = completadasList.length + incumplidasList.length;

        return {
            total: totalOcurrencias,
            completadas: completadasList.length,
            incumplidas: incumplidasList,
            porcentajeCumplimiento: resueltas > 0
                ? Math.round((completadasList.length / resueltas) * 100)
                : null,
        };
    }, [historial]);

    const columns = useMemo<TableColumn<TareaOcurrencia>[]>(() => [
        {
            id: "tarea",
            name: "Tarea",
            selector: row => row.tarea_nombre_snap,
            sortable: true,
            grow: 2,
        },
        {
            id: "plan",
            name: "Plan de Limpieza",
            selector: row => row.plan_nombre_snap,
            sortable: true,
            grow: 2,
        },
        {
            id: "prioridad",
            name: "Prioridad",
            center: true,
            sortable: true,
            selector: row => row.prioridad_snap,
            cell: row => (
                <Badge bg={PRIORIDAD_VARIANTS[row.prioridad_snap as Prioridad] ?? "secondary"}>
                    {PRIORIDAD_LABELS[row.prioridad_snap as Prioridad] ?? row.prioridad_snap}
                </Badge>
            ),
        },
        {
            id: "fecha",
            name: "Fecha",
            center: true,
            sortable: true,
            selector: row => row.fecha,
            cell: row => formatearFecha(row.fecha),
        },
        {
            id: "fecha_completado",
            name: "Fecha Completado",
            center: true,
            sortable: true,
            selector: row => row.fecha_completado ?? "",
            cell: row => formatearFecha(row.fecha_completado),
        },
        {
            id: "estado",
            name: "Estado",
            center: true,
            sortable: true,
            selector: row => getEstadoHistorial(row),
            cell: row => {
                const estado = getEstadoHistorial(row);
                return <Badge bg={ESTADO_HISTORIAL_VARIANTS[estado]}>{estado}</Badge>;
            },
        },
    ], []);

    const conditionalRowStyles: ConditionalStyles<TareaOcurrencia>[] = [
        {
            when: row => getEstadoHistorial(row) === "Completada",
            style: { backgroundColor: "#f0fdf4" },
        },
        {
            when: row => getEstadoHistorial(row) === "Incumplida",
            style: { backgroundColor: "#fef2f2" },
        },
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader title="Historial de Checklists" />
                </Col>
            </Row>

            <Row className="p-2 align-items-end g-3">
                <Col xs="auto">
                    <Form.Label className="mb-1 small fw-semibold">Desde</Form.Label>
                    <Form.Control
                        type="date"
                        value={fechaDesde}
                        max={fechaHasta}
                        onChange={(e) => setFechaDesde(e.target.value)}
                    />
                </Col>
                <Col xs="auto">
                    <Form.Label className="mb-1 small fw-semibold">Hasta</Form.Label>
                    <Form.Control
                        type="date"
                        value={fechaHasta}
                        min={fechaDesde}
                        onChange={(e) => setFechaHasta(e.target.value)}
                    />
                </Col>
                <Col className="d-flex justify-content-end">
                    <Button
                        variant="outline-danger"
                        active={soloIncumplidas}
                        onClick={() => setSoloIncumplidas((prev) => !prev)}
                    >
                        <i className="bi bi-funnel me-1"></i>
                        {soloIncumplidas ? "Ver todas" : "Ver solo incumplidas"}
                    </Button>
                </Col>
            </Row>

            {!rangoValido && (
                <Row className="p-2">
                    <Col>
                        <Alert variant="warning">
                            Seleccioná un rango de fechas válido (la fecha "Desde" debe ser anterior o igual a "Hasta").
                        </Alert>
                    </Col>
                </Row>
            )}

            {rangoValido && isLoading && (
                <Row className="p-2">
                    <Col>
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </Col>
                </Row>
            )}

            {rangoValido && error && (
                <Row className="p-2">
                    <Col md={6}>
                        <Alert variant="danger">Ocurrió un error al cargar el historial de checklists.</Alert>
                    </Col>
                </Row>
            )}

            {rangoValido && historial && !error && (
                <>
                    <Row className="p-2 g-3">
                        <Col md={3} sm={6}>
                            <Card className="text-center h-100">
                                <Card.Body>
                                    <Card.Subtitle className="text-muted mb-2">Total de Tareas</Card.Subtitle>
                                    <Card.Title className="fs-3 mb-0">{total}</Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6}>
                            <Card className="text-center h-100">
                                <Card.Body>
                                    <Card.Subtitle className="text-muted mb-2">Completadas</Card.Subtitle>
                                    <Card.Title className="fs-3 mb-0 text-success">{completadas}</Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6}>
                            <Card className="text-center h-100">
                                <Card.Body>
                                    <Card.Subtitle className="text-muted mb-2">Incumplidas</Card.Subtitle>
                                    <Card.Title className="fs-3 mb-0 text-danger">{incumplidas.length}</Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6}>
                            <Card className="text-center h-100">
                                <Card.Body>
                                    <Card.Subtitle className="text-muted mb-2">% de Cumplimiento</Card.Subtitle>
                                    <Card.Title className="fs-3 mb-0">
                                        {porcentajeCumplimiento === null ? "-" : `${porcentajeCumplimiento}%`}
                                    </Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>


                    <Row className="p-2">
                        <Col>
                            <AppTable
                                columns={columns}
                                data={soloIncumplidas ? incumplidas : historial}
                                conditionalRowStyles={conditionalRowStyles}
                            />
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
}
