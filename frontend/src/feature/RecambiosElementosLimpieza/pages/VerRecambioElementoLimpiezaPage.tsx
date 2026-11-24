import { Container, Spinner, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "../../../components/PageHeader";
import { Dato } from "../../../components/Dato";
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

            <Card className="shadow-sm border-0 rounded-3 mb-4 mt-3 text-start">
                <Card.Body className="p-4">
                    <h6 className="detalle-seccion-titulo">Elemento de limpieza</h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta="Elemento" md={6}>
                            {elemento ? (
                                <Button
                                    variant="link"
                                    className="p-0 fw-semibold text-decoration-none text-start"
                                    onClick={() => navigate(`/elementos-limpieza/${elemento.id}`)}
                                >
                                    <i className="bi bi-box-arrow-up-right small me-1"></i>
                                    {elemento.nombre}
                                </Button>
                            ) : "-"}
                        </Dato>
                        <Dato etiqueta="Código" md={6}>
                            <span className="fw-bold">{elemento?.codigo ?? "-"}</span>
                        </Dato>
                    </Row>

                    <h6 className="detalle-seccion-titulo">Recambio</h6>
                    <Row className="g-3">
                        <Dato etiqueta="Fecha" md={4}>
                            {recambio.fecha ? recambio.fecha.slice(0, 10).split("-").reverse().join("/") : "-"}
                        </Dato>
                        <Dato etiqueta="Observación" md={8}>
                            {recambio.observacion || <span className="text-muted fst-italic">Sin observaciones</span>}
                        </Dato>
                    </Row>
                </Card.Body>
            </Card>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
                <Button variant="outline-secondary" onClick={() => navigate("/recambios-elementos-limpieza")}>
                    <i className="bi bi-arrow-left me-1"></i>
                    Volver a la lista
                </Button>
                {elemento && (
                    <Button variant="outline-primary" onClick={() => navigate(`/elementos-limpieza/${elemento.id}`)}>
                        <i className="bi bi-eye me-1"></i>
                        Ver Elemento
                    </Button>
                )}
            </div>
        </Container>
    );
}
