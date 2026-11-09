import { Container, Alert, Row, Col, Card, Button, ListGroup } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";
import type { Cliente } from "../types";
import { PageLoading } from "../../../components/PageLoading";

export function VerClientePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentUser } = useAuth();

    const { data: cliente, isLoading, error } = useApi<Cliente>(`/clientes/${id}`);

    const tituloPagina = "Detalle del Cliente";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!cliente || error) return (
        <Container>
            <PageHeader title="Cliente no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrio un error al cargar los datos." : "El cliente ingresado no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    const direcciones = (cliente.direcciones ?? []).filter(dir => dir.activo);

    return (
        <Container>
            <PageHeader title={tituloPagina} />

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Razon Social</Col>
                                <Col sm={7} className="fs-6 fw-semibold">{cliente.razon_social}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">CUIT</Col>
                                <Col sm={7} className="fs-6">{cliente.cuit}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Telefono</Col>
                                <Col sm={7} className="fs-6">{cliente.telefono || '-'}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Email</Col>
                                <Col sm={7} className="fs-6">{cliente.email || '-'}</Col>
                            </Row>

                            <Row className="mb-2 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Estado Actual</Col>
                                <Col sm={7}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: cliente.activo ? '#dcfce7' : '#fee2e2',
                                            color: cliente.activo ? '#166534' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {cliente.activo ? 'Activo' : 'Inactivo'}
                                    </div>
                                </Col>
                            </Row>

                            <hr className="my-4" />

                            <h5 className="mb-3">Direcciones de entrega registradas</h5>

                            {direcciones.length === 0 ? (
                                <p className="text-muted mb-0">Este cliente todavia no tiene direcciones registradas.</p>
                            ) : (
                                <ListGroup variant="flush" className="border rounded bg-white">
                                    {direcciones.map((dir) => (
                                        <ListGroup.Item key={dir.id} className="py-2">
                                            <div>
                                                <strong>{dir.calle_altura}</strong> - {dir.localidad}, {dir.provincia} (CP: {dir.codigo_postal})
                                            </div>
                                            {dir.descripcion ? (
                                                <div className="small text-muted">{dir.descripcion}</div>
                                            ) : null}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-start gap-2">
                            <Button
                                variant="outline-secondary"
                                onClick={() => navigate('/clientes')}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>

                            {currentUser?.administrar && (
                                <Button
                                    variant="primary"
                                    disabled={!cliente.activo}
                                    onClick={() => navigate(`/clientes/${cliente.id}/edit`)}
                                >
                                    <i className="bi bi-pencil me-1"></i>Editar Cliente
                                </Button>
                            )}
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}