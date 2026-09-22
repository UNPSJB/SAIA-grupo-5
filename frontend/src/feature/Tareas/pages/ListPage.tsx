import { useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Tab, Tabs } from "react-bootstrap";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { PlanLimpieza } from "../../PlanesLimpieza/types";
import { DeleteTareaModal } from "../components/DeleteTareaModal";
import { TareaDetalleModal } from "../components/TareaDetalleModal";
import { TareaFormModal } from "../components/TareaFormModal";
import { Frecuencia, PRIORIDAD_LABELS, PRIORIDAD_VARIANTS } from "../types";
import type { Tarea } from "../types";

// Primero elegir plan de limpieza
const FRECUENCIA_TABS: { key: Frecuencia; label: string; emptyMessage: string }[] = [
    { key: Frecuencia.DIARIA, label: "Diaria", emptyMessage: "No hay tareas diarias en este plan." },
    { key: Frecuencia.SEMANAL, label: "Semanal", emptyMessage: "No hay tareas semanales en este plan." },
    { key: Frecuencia.QUINCENAL, label: "Quincenal", emptyMessage: "No hay tareas quincenales en este plan." },
    { key: Frecuencia.MENSUAL, label: "Mensual", emptyMessage: "No hay tareas mensuales en este plan." },
];

export function TareasPage() {
    const [planId, setPlanId] = useState("");
    const { data: planes, error: errorPlanes, isLoading: isLoadingPlanes } = useApi<PlanLimpieza[]>("/planes-limpieza/");
    const tareasKey = planId ? `/tareas/?plan_id=${planId}` : null;
    const { data: tareas, error: errorTareas, isLoading: isLoadingTareas } = useApi<Tarea[]>(tareasKey);
    const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null);
    const [tareaToDelete, setTareaToDelete] = useState<Tarea | null>(null);

    // { tarea: null } = alta
    // { tarea: Tarea } = edición
    const [formularioTarea, setFormularioTarea] = useState<{ tarea: Tarea | null } | null>(null);

    const planSeleccionado = (planes ?? []).find((plan) => String(plan.id) === planId);

    const tareasPorFrecuencia = useMemo(() => {
        const agrupadas: Record<number, Tarea[]> = {};
        (tareas ?? [])
            .filter((tarea) => tarea.activo)
            .forEach((tarea) => {
                (agrupadas[tarea.frecuencia] ??= []).push(tarea);
            });
        return agrupadas;
    }, [tareas]);

    return (
        <Container>
            <PageHeader title="Tareas" />

            <Form.Group className="mb-4" controlId="formPlanLimpieza">
                <Form.Label className="fw-bold">Plan de Limpieza</Form.Label>
                <Form.Select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    disabled={isLoadingPlanes}
                >
                    <option value="">Seleccioná un plan de limpieza...</option>
                    {(planes ?? []).map((plan) => (
                        <option key={plan.id} value={plan.id}>
                            {plan.nombre}
                        </option>
                    ))}
                </Form.Select>
                {errorPlanes && (
                    <Alert variant="danger" className="mt-2 mb-0 py-2">
                        No se pudieron cargar los planes de limpieza.
                    </Alert>
                )}
            </Form.Group>

            <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                    {!planId ? (
                        <p className="text-muted">
                            Seleccioná un plan de limpieza para ver sus tareas.
                        </p>
                    ) : isLoadingTareas ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Cargandon Tareas...</span>
                            </Spinner>
                        </div>
                    ) : errorTareas ? (
                        <Alert variant="danger">Ocurrió un error al cargar las tareas de este plan.</Alert>
                    ) : null}
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    className="ms-3 flex-shrink-0"
                    disabled={!planId}
                    onClick={() => setFormularioTarea({ tarea: null })}
                >
                    + Agregar tarea
                </Button>
            </div>

            {planId && !isLoadingTareas && !errorTareas && (
                <Tabs defaultActiveKey={String(Frecuencia.DIARIA)} className="mb-3">
                    {FRECUENCIA_TABS.map(({ key, label, emptyMessage }) => {
                        const tareasDeLaPestania = tareasPorFrecuencia[key] ?? [];
                        return (
                            <Tab key={key} eventKey={String(key)} title={label}>
                                {tareasDeLaPestania.length > 0 ? (
                                    <Container fluid className="mt-3 px-0">
                                        <Row>
                                            {tareasDeLaPestania.map((tarea) => (
                                                <Col key={tarea.id} xs={12} md={6} lg={4} className="mb-3">
                                                    <Card
                                                        role="button"
                                                        className="shadow rounded-3 overflow-hidden"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => setTareaSeleccionada(tarea)}
                                                    >
                                                        <Card.Header className="bg-secondary-subtle">
                                                            {tarea.nombre}
                                                        </Card.Header>
                                                        <Card.Body>
                                                            <Card.Text className="mb-0">{tarea.descripcion}</Card.Text>
                                                        </Card.Body>
                                                        <Card.Footer className="bg-transparent border-top-0 text-end py-2">
                                                            <Badge bg={PRIORIDAD_VARIANTS[tarea.prioridad]}>
                                                                {PRIORIDAD_LABELS[tarea.prioridad]}
                                                            </Badge>
                                                        </Card.Footer>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Container>
                                ) : (
                                    <p className="text-muted mt-3">{emptyMessage}</p>
                                )}
                            </Tab>
                        );
                    })}
                </Tabs>
            )}

            <TareaDetalleModal
                tarea={tareaSeleccionada}
                onHide={() => setTareaSeleccionada(null)}
                onEditar={() => {
                    setFormularioTarea({ tarea: tareaSeleccionada });
                    setTareaSeleccionada(null);
                }}
                onEliminar={() => {
                    setTareaToDelete(tareaSeleccionada);
                    setTareaSeleccionada(null);
                }}
            />

            <DeleteTareaModal
                tarea={tareaToDelete}
                onHide={() => setTareaToDelete(null)}
                onDeleted={() => tareasKey && mutate(tareasKey)}
            />

            {formularioTarea && planId && (
                <TareaFormModal
                    show
                    onHide={() => setFormularioTarea(null)}
                    planId={Number(planId)}
                    planNombre={planSeleccionado?.nombre ?? ""}
                    tarea={formularioTarea.tarea}
                    onSaved={() => tareasKey && mutate(tareasKey)}
                />
            )}
        </Container>
    );
}
