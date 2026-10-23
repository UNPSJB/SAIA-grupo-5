import { Container, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { UnidadMedida } from "../types";
import { PageLoading } from "../../../components/PageLoading";

export function VerUnidadMedidaPage() {
    const navigate = useNavigate();
    const { id } = useParams(); 

    const { data: unidadMedida, isLoading, error } = useApi<UnidadMedida>(`/unidades-medida/${id}`);

    const tituloPagina = "Detalle de Unidad de Medida"

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!unidadMedida || error) return (
        <Container>
            <PageHeader title="Unidad de Medida no encontrada." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrio un error al cargar los datos." : "La Unidad de Medida ingresada no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <Container>
            <PageHeader title={tituloPagina} />

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Nombre</Col>
                                <Col sm={8} className="fs-5">{unidadMedida.nombre}</Col>
                            </Row>

                            <Row className="mb-2 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Estado Actual</Col>
                                <Col sm={8}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: unidadMedida.activo ? '#dcfce7' : '#fee2e2',
                                            color: unidadMedida.activo ? '#166534' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${unidadMedida.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                        {unidadMedida.activo ? 'Activo' : 'Inactivo'}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-end gap-2">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate('/unidades-medida')}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>
                            
                            <Button 
                                variant="primary" 
                                disabled={!unidadMedida.activo}
                                onClick={() => navigate(`/unidades-medida/${unidadMedida.id}/edit`)}
                            >
                                <i className="bi bi-pencil me-1"></i>Editar Unidad de Medida  

                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}