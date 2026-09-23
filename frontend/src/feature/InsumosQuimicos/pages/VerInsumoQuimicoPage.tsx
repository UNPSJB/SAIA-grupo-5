import { Container, Spinner, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { InsumoQuimico } from "../types";

export function VerInsumoQuimicoPage() {
    const navigate = useNavigate();
    const { id } = useParams(); 

    const { data: insumoQuimico, isLoading, error } = useApi<InsumoQuimico>(`/insumos-quimicos/${id}`);

    if (isLoading) return (
        <>
            <PageHeader title="Detalle del Insumo Químico" />
            <Spinner animation="border" role="status" className="d-block mx-auto mt-5 text-primary">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    );

    if (!insumoQuimico || error) return (
        <Container>
            <PageHeader title="Insumo Químico no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrio un error al cargar los datos." : "El Insumo Químico ingresado no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <Container>
            <PageHeader title="Detalle del Insumo Químico" />

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Header className="bg-white border-bottom p-4">
                            <h5 className="mb-0 fw-bold text-primary">
                                <i className="bi bi-info-circle me-2"></i>
                                Información del Insumo Químico
                            </h5>
                        </Card.Header>
                        
                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Nombre</Col>
                                <Col sm={8} className="fs-5">{insumoQuimico.nombre}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Tipo de Químico</Col>
                                <Col sm={8} className="fs-5">{insumoQuimico.tipo.nombre}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Unidad de medida</Col>
                                <Col sm={8} className="fs-5">{insumoQuimico.unidad_medida}</Col>
                            </Row>

                            <Row className="mb-2 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Estado Actual</Col>
                                <Col sm={8}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: insumoQuimico.activo ? '#dcfce7' : '#fee2e2',
                                            color: insumoQuimico.activo ? '#166534' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${insumoQuimico.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                        {insumoQuimico.activo ? 'Activo' : 'Inactivo'}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-end gap-2">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate('/insumos-quimicos')}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>
                            
                            <Button 
                                variant="primary" 
                                disabled={!insumoQuimico.activo}
                                onClick={() => navigate(`/insumos-quimicos/${insumoQuimico.id}/edit`)}
                            >
                                <i className="bi bi-pencil me-1"></i>Editar Insumo Químico
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}