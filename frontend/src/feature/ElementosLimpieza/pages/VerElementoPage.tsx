import { Container, Spinner, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { ElementoLimpieza } from "../types";
import type { TipoElementoLimpieza } from "../../TiposElementoLimpieza/types";
import type { RecambioElementoLimpieza } from "../../RecambiosElementosLimpieza/types";

export function VerElementoPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: elementoLimpieza, isLoading, error } = useApi<ElementoLimpieza>(`/elementos-limpieza/${id}`);
    const { data: recambios } = useApi<RecambioElementoLimpieza[]>(`/recambios-elementos-limpieza/elemento/${id}`);
    const { data: tipos } = useApi<TipoElementoLimpieza[]>("/elementos-limpieza/tipos");

    const nombreTipo = tipos?.find(tipo => tipo.id === elementoLimpieza?.tipo_id)?.nombre ?? "-";

    if (isLoading) return (
        <>
            <PageHeader title="Detalle del Elemento de Limpieza" />
            <Spinner animation="border" role="status" className="d-block mx-auto mt-5 text-primary">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    );

    if (!elementoLimpieza || error) return (
        <Container>
            <PageHeader title="Elemento de Limpieza no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrió un error al cargar los datos." : "El Elemento de Limpieza ingresado no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <Container>
            <PageHeader title="Detalle del Elemento de Limpieza" />

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Header className="bg-white border-bottom p-4">
                            <h5 className="mb-0 fw-bold text-primary">
                                <i className="bi bi-info-circle me-2"></i>
                                Información del Elemento de Limpieza
                            </h5>
                        </Card.Header>

                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Código</Col>
                                <Col sm={8} className="fs-5">{elementoLimpieza.codigo}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Nombre</Col>
                                <Col sm={8} className="fs-5">{elementoLimpieza.nombre}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Tipo</Col>
                                <Col sm={8} className="fs-5">{nombreTipo}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Material</Col>
                                <Col sm={8} className="fs-5">{elementoLimpieza.material ?? "-"}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Ubicación</Col>
                                <Col sm={8} className="fs-5">{elementoLimpieza.ubicacion ?? "-"}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Frecuencia de recambio</Col>
                                <Col sm={8} className="fs-5">
                                    {elementoLimpieza.frecuencia_recambio
                                        ? `${elementoLimpieza.frecuencia_recambio} días`
                                        : "Sin definir"}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Días para recambio</Col>
                                <Col sm={8} className="fs-5">
                                    {elementoLimpieza.dias_restantes === null
                                        ? "Sin definir"
                                        : elementoLimpieza.dias_restantes < 0
                                            ? "Vencido"
                                            : elementoLimpieza.dias_restantes === 0
                                                ? "Recambio hoy"
                                                : `${elementoLimpieza.dias_restantes} días`}
                                </Col>
                            </Row>

                            <Row className="mb-2 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Estado Actual</Col>
                                <Col sm={8}>
                                    <div
                                        style={{
                                            padding: "6px 16px",
                                            borderRadius: "20px",
                                            background: elementoLimpieza.estado ? "#dcfce7" : "#fee2e2",
                                            color: elementoLimpieza.estado ? "#166534" : "#991b1b",
                                            fontWeight: 700,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <i className={`bi ${elementoLimpieza.estado ? "bi-check-circle-fill" : "bi-x-circle-fill"} me-2`}></i>
                                        {elementoLimpieza.estado ? "Activo" : "Inactivo"}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-end gap-2">
                            <Button
                                variant="outline-secondary"
                                onClick={() => navigate("/elementos-limpieza")}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>

                            <Button
                                variant="primary"
                                disabled={!elementoLimpieza.estado}
                                onClick={() => navigate(`/elementos-limpieza/${elementoLimpieza.id}/edit`)}
                            >
                                <i className="bi bi-pencil me-1"></i>Editar Elemento
                            </Button>
                        </Card.Footer>
                    </Card>

                    <Card className="shadow-sm border-0 rounded-3 mt-4">
                        <Card.Header className="bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold text-primary">
                                <i className="bi bi-clock-history me-2"></i>
                                Historial de Recambios
                            </h5>

                            {elementoLimpieza.estado && (
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => navigate(`/recambios-elementos-limpieza/new/${elementoLimpieza.id}`)}
                                >
                                    <i className="bi bi-arrow-repeat me-1 "></i>
                                    Registrar Recambio
                                </Button>
                            )}
                        </Card.Header>

                        <Card.Body className="p-4">
                            {!recambios || recambios.length === 0 ? (
                                <p className="text-muted mb-0">
                                    Este elemento todavía no tiene recambios registrados.
                                </p>
                            ) : (
                                recambios.map((recambio) => (
                                    <Row
                                        key={recambio.id}
                                        className="mb-3 border-bottom pb-3 align-items-center"
                                    >
                                        <Col sm={3} className="fw-bold text-secondary">
                                            {recambio.fecha}
                                        </Col>

                                        <Col sm={9}>
                                            {recambio.observacion ?? "-"}
                                        </Col>
                                    </Row>
                                ))
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}