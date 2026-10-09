import { Container, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { Insumo } from "../types";
import { PageLoading } from "../../../components/PageLoading";
import { useAuth } from "../../../hooks";

export function VerInsumoPage() {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const { currentUser } = useAuth();

    const { data: insumo, isLoading, error } = useApi<Insumo>(`/insumos/${id}`);

    const tituloPagina = "Detalle del Insumo";

    if (isLoading) return  <PageLoading title={tituloPagina} />;

    if (!insumo || error) return (
        <Container>
            <PageHeader title="Insumo no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrio un error al cargar los datos." : "El Insumo ingresado no existe."}
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
                                <Col sm={8} className="fs-5">{insumo.nombre}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Unidad de Medida</Col>
                                <Col sm={8}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div
                                            style={{
                                            padding: '4px 12px',
                                            borderRadius: '16px',
                                            background: '#dbeafe',
                                            color: '#1d4ed8',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {insumo.unidad_medida}
                                    </div>
                                </div>
                                </Col>
                            </Row>

                            <Row className="mb-2 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Estado Actual</Col>
                                <Col sm={8}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: insumo.activo ? '#dcfce7' : '#fee2e2',
                                            color: insumo.activo ? '#166534' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${insumo.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                        {insumo.activo ? 'Activo' : 'Inactivo'}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-end gap-2">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate('/insumos')}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>
                            {currentUser?.administrar && (
                                <Button 
                                    variant="primary" 
                                    disabled={!insumo.activo}
                                    onClick={() => navigate(`/insumos/${insumo.id}/edit`)}
                                >
                                    <i className="bi bi-pencil me-1"></i>Editar Insumo   

                                </Button>
                            )}
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}