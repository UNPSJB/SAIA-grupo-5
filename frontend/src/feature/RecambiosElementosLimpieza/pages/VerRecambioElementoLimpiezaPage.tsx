import { Container, Spinner, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";

import type { RecambioElementoLimpieza } from "../types";
import type { ElementoLimpieza } from "../../ElementosLimpieza/types";

export function VerRecambioElementoLimpiezaPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: recambio, isLoading, error } = useApi<RecambioElementoLimpieza>(
        `/recambios-elementos-limpieza/${id}`
    );

    const { data: elemento } = useApi<ElementoLimpieza>(
        recambio ? `/elementos-limpieza/${recambio.elemento_id}` : null
    );

    if (isLoading) return (
        <>
            <PageHeader title="Detalle del Recambio" />
            <Spinner animation="border" role="status" className="d-block mx-auto mt-5 text-primary">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    );

    if (!recambio || error) return (
        <Container>
            <PageHeader title="Recambio no encontrado" />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        El recambio ingresado no existe.
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <Container>
            <PageHeader title="Detalle del Recambio" />

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Header className="bg-white border-bottom p-4">
                            <h5 className="mb-0 fw-bold text-primary">
                                <i className="bi bi-clock-history me-2"></i>
                                Información del Recambio
                            </h5>
                        </Card.Header>

                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Elemento</Col>
                                <Col sm={8} className="fs-5">
                                    {elemento?.nombre ?? "-"}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Código</Col>
                                <Col sm={8} className="fs-5">
                                    {elemento?.codigo ?? "-"}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Fecha</Col>
                                <Col sm={8} className="fs-5">
                                    {recambio.fecha}
                                </Col>
                            </Row>

                            <Row className="mb-2 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Observación</Col>
                                <Col sm={8} className="fs-5">
                                    {recambio.observacion ?? "-"}
                                </Col>
                            </Row>
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-end gap-2">
                            <Button
                                variant="outline-secondary"
                                onClick={() => navigate("/recambios-elementos-limpieza")}
                            >
                                <i className="bi bi-arrow-left me-1"></i>
                                Volver a la lista
                            </Button>

                            {elemento && (
                                <Button
                                    variant="outline-primary"
                                    onClick={() => navigate(`/elementos-limpieza/${elemento.id}`)}
                                >
                                    <i className="bi bi-eye me-1"></i>
                                    Ver Elemento
                                </Button>
                            )}
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}