import { Container, Spinner, Alert, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";

import { PRIORIDAD_LABELS, PRIORIDAD_VARIANTS, type Prioridad } from "../../Tareas/types";
import { getEstadoHistorial, ESTADO_HISTORIAL_VARIANTS } from "../types";
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

            <Row className="justify-content-center mt-3 mb-5">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Header className="bg-white border-bottom p-4">
                            <h5 className="mb-0 fw-bold text-primary">
                                <i className="bi bi-card-checklist me-2"></i>
                                Información de la Tarea
                            </h5>
                        </Card.Header>
                        
                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Nombre</Col>
                                <Col sm={8} className="fs-5">{tarea.tarea_nombre_snap}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Plan de Limpieza</Col>
                                <Col sm={8} className="fs-5">{tarea.plan_nombre_snap}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Descripcion</Col>
                                <Col sm={8}>
                                    {tarea.tarea_descripcion_snap ? (
                                        <span>{tarea.tarea_descripcion_snap}</span>
                                    ) : (
                                        <span className="text-muted fst-italic">Sin descripcion detallada</span>
                                    )}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Frecuencia</Col>
                                <Col sm={8} className="fs-5">{tarea.frecuencia_snap} {tarea.frecuencia_snap === "1" ? "dia" : "dias"}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Accion Correctiva</Col>
                                <Col sm={8}>
                                    {tarea.accion_correctiva_snap || <span className="text-muted fst-italic">-</span>}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Prioridad</Col>
                                <Col sm={8}>
                                    <Badge bg={PRIORIDAD_VARIANTS[tarea.prioridad_snap as Prioridad] ?? "secondary"} className="fs-6">
                                        {PRIORIDAD_LABELS[tarea.prioridad_snap as Prioridad] ?? tarea.prioridad_snap}
                                    </Badge>
                                </Col>
                            </Row>

                            <Row className="mb-4 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Estado</Col>
                                <Col sm={8}>
                                    <Badge bg={ESTADO_HISTORIAL_VARIANTS[estado]} className="fs-6 px-3 py-2 rounded-pill">
                                        {estado}
                                    </Badge>
                                </Col>
                            </Row>

                            
                            <h6 className="fw-bold text-primary mb-3 mt-4">
                                <i className="bi bi-clock-history me-2"></i>Auditoria de la Tarea
                            </h6>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Realizada por</Col>
                                <Col sm={8}>
                                    
                                    {tarea.operario_id ? `${tarea.operario?.nombre}, ${tarea.operario?.apellido}` : <span className="text-muted fst-italic">Pendiente</span>}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Fecha de Completado</Col>
                                <Col sm={8}>
                                    {tarea.fecha_completado 
                                        ? new Date(tarea.fecha_completado).toLocaleString("es-AR") 
                                        : <span className="text-muted fst-italic">-</span>}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">¿Fue editada?</Col>
                                <Col sm={8}>
                                    {tarea.fue_editada ? (
                                        <span className="text-warning fw-bold">
                                            <i className="bi bi-pencil-square me-1"></i>
                                            Si, el {new Date(tarea.fecha_edicion!).toLocaleString("es-AR")}
                                        </span>
                                    ) : (
                                        <span className="text-muted fst-italic">No fue editada</span>
                                    )}
                                </Col>
                            </Row>

                            <Row className="align-items-start">
                                <Col sm={4} className="fw-bold text-secondary">Foto Evidencia</Col>
                                <Col sm={8}>
                                    {tarea.foto_evidencia ? (
                                        <img 
                                            src={tarea.foto_evidencia} 
                                            alt="Evidencia" 
                                            className="img-fluid rounded border shadow-sm mt-2"
                                            style={{ maxHeight: '250px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <span className="text-muted fst-italic">No se subio foto de evidencia</span>
                                    )}
                                </Col>
                            </Row>
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-end">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate('/historial')}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver al Historial
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}