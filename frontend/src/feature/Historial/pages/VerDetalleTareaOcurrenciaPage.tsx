import { Container, Spinner, Alert, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";

import { PRIORIDAD_LABELS, PRIORIDAD_VARIANTS, type Prioridad } from "../../Tareas/types";
import { getEstadoHistorial, ESTADO_HISTORIAL_ESTILOS } from "../types";
import { EstadoBadge } from "../../../components/EstadoBadge";
import { Dato } from "../../../components/Dato";
import type { TareaOcurrencia } from "../../TareasOcurrencias/types"; 

export function VerDetalleTareaOcurrenciaPage() {
    const navigate = useNavigate();
    const { id } = useParams(); 

    const { data: tarea, isLoading, error } = useApi<TareaOcurrencia>(`/tareas-ocurrencia/${id}`);

    if (isLoading) return (
        <>
            <PageHeader title="Detalle de la Tarea" />
            <Spinner animation="border" role="status" className="d-block mx-auto mt-5 text-primary">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    );

    if (!tarea || error) return (
        <Container>
            <PageHeader title="Tarea no encontrada" />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrio un error al cargar los datos." : "La Tarea ingresada no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    const estado = getEstadoHistorial(tarea);

    return (
        <Container>
            <PageHeader title="Detalle de la Tarea" />

            <Card className="shadow-sm border-0 rounded-3 mb-4 mt-3 text-start">
                <Card.Body className="p-4">
                    <h6 className="detalle-seccion-titulo">Datos de la tarea</h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta="Nombre" md={6}>
                            <span className="fw-semibold">{tarea.tarea_nombre_snap}</span>
                        </Dato>
                        <Dato etiqueta="Plan de Limpieza" md={6}>{tarea.plan_nombre_snap}</Dato>
                        <Dato etiqueta="Frecuencia" md={6} lg={4}>
                            {tarea.frecuencia_snap} {tarea.frecuencia_snap === "1" ? "día" : "días"}
                        </Dato>
                        <Dato etiqueta="Prioridad" md={6} lg={4}>
                            <Badge bg={PRIORIDAD_VARIANTS[tarea.prioridad_snap as Prioridad] ?? "secondary"}>
                                {PRIORIDAD_LABELS[tarea.prioridad_snap as Prioridad] ?? tarea.prioridad_snap}
                            </Badge>
                        </Dato>
                        <Dato etiqueta="Estado" md={6} lg={4}>
                            <EstadoBadge tono={ESTADO_HISTORIAL_ESTILOS[estado].tono} icono={ESTADO_HISTORIAL_ESTILOS[estado].icono}>
                                {estado}
                            </EstadoBadge>
                        </Dato>
                        <Dato etiqueta="Descripción" md={6}>
                            {tarea.tarea_descripcion_snap || <span className="text-muted fst-italic">Sin descripción detallada</span>}
                        </Dato>
                        <Dato etiqueta="Acción Correctiva" md={6}>
                            {tarea.accion_correctiva_snap || <span className="text-muted fst-italic">-</span>}
                        </Dato>
                    </Row>

                    <h6 className="detalle-seccion-titulo">Auditoría de la tarea</h6>
                    <Row className="g-3">
                        <Dato etiqueta="Realizada por" md={6} lg={4}>
                            {tarea.operario_id
                                ? `${tarea.operario?.nombre}, ${tarea.operario?.apellido}`
                                : <span className="text-muted fst-italic">Pendiente</span>}
                        </Dato>
                        <Dato etiqueta="Fecha de Completado" md={6} lg={4}>
                            {tarea.fecha_completado
                                ? new Date(tarea.fecha_completado).toLocaleString("es-AR")
                                : <span className="text-muted fst-italic">-</span>}
                        </Dato>
                        <Dato etiqueta="¿Fue editada?" md={6} lg={4}>
                            {tarea.fue_editada ? (
                                <span className="text-warning-emphasis fw-semibold">
                                    <i className="bi bi-pencil-square me-1"></i>
                                    Sí, el {new Date(tarea.fecha_edicion!).toLocaleString("es-AR")}
                                </span>
                            ) : (
                                <span className="text-muted fst-italic">No fue editada</span>
                            )}
                        </Dato>
                        <Dato etiqueta="Foto Evidencia">
                            {tarea.foto_evidencia ? (
                                <img
                                    src={tarea.foto_evidencia}
                                    alt="Evidencia"
                                    className="img-fluid rounded border shadow-sm"
                                    style={{ maxHeight: '250px', objectFit: 'cover' }}
                                />
                            ) : (
                                <span className="text-muted fst-italic">No se subió foto de evidencia</span>
                            )}
                        </Dato>
                    </Row>
                </Card.Body>
            </Card>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
                <Button variant="outline-secondary" onClick={() => navigate('/historial')}>
                    <i className="bi bi-arrow-left me-1"></i>Volver al Historial
                </Button>
            </div>
        </Container>
    );
}
