import { Container, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";
import type { Cliente } from "../types";
import { PageLoading } from "../../../components/PageLoading";
import { Dato } from "../../../components/Dato";
import { EstadoBadge } from "../../../components/EstadoBadge";

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

            <Card className="shadow-sm border-0 rounded-3 mb-4 mt-3 text-start">
                <Card.Body className="p-4">
                    <h6 className="detalle-seccion-titulo">Datos del cliente</h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta="Razón Social" lg={6}>
                            <span className="fw-semibold">{cliente.razon_social}</span>
                        </Dato>
                        <Dato etiqueta="CUIT" md={6} lg={3}>{cliente.cuit}</Dato>
                        <Dato etiqueta="Estado Actual" md={6} lg={3}>
                            <EstadoBadge
                                tono={cliente.activo ? 'success' : 'danger'}
                                icono={cliente.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}
                            >
                                {cliente.activo ? 'Activo' : 'Inactivo'}
                            </EstadoBadge>
                        </Dato>
                        <Dato etiqueta="Teléfono" md={6}>
                            {cliente.telefono || <span className="text-muted fst-italic">Sin teléfono</span>}
                        </Dato>
                        <Dato etiqueta="Email" md={6}>
                            {cliente.email || <span className="text-muted fst-italic">Sin email</span>}
                        </Dato>
                    </Row>

                    <h6 className="detalle-seccion-titulo">Direcciones de entrega registradas</h6>
                    {direcciones.length === 0 ? (
                        <p className="text-muted mb-0">Este cliente todavía no tiene direcciones registradas.</p>
                    ) : (
                        <Row className="g-3">
                            {direcciones.map((dir) => (
                                <Dato key={dir.id} etiqueta={`${dir.localidad}, ${dir.provincia}`} md={6}>
                                    <span className="fw-semibold">{dir.calle_altura}</span>
                                    <div className="small text-muted">CP: {dir.codigo_postal}</div>
                                    {dir.descripcion && <div className="small text-muted">{dir.descripcion}</div>}
                                </Dato>
                            ))}
                        </Row>
                    )}
                </Card.Body>
            </Card>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
                <Button variant="outline-secondary" onClick={() => navigate('/clientes')}>
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
            </div>
        </Container>
    );
}
