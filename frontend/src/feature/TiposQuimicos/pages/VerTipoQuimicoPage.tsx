import { Container, Spinner, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { TipoQuimico } from "../types";

export function VerTipoQuimicoPage() {
    const navigate = useNavigate();
    const { id } = useParams(); 

    const { data: tipoQuimico, isLoading, error } = useApi<TipoQuimico>(`/tipos-quimicos/${id}`);

    if (isLoading) return (
        <>
            <PageHeader title="Detalle del Tipo Químico" />
            <Spinner animation="border" role="status" className="d-block mx-auto mt-5 text-primary">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    );

    if (!tipoQuimico || error) return (
        <Container>
            <PageHeader title="Tipo Químico no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrio un error al cargar los datos." : "El Tipo Químico ingresado no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <Container>
            <PageHeader title="Detalle del Tipo Químico" />

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Header className="bg-white border-bottom p-4">
                            <h5 className="mb-0 fw-bold text-primary">
                                <i className="bi bi-info-circle me-2"></i>
                                Información del Tipo Químico
                            </h5>
                        </Card.Header>
                        
                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Nombre</Col>
                                <Col sm={8} className="fs-5">{tipoQuimico.nombre}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Descripcion</Col>
                                <Col sm={8}>
                                    {tipoQuimico.descripcion ? (
                                        <span>{tipoQuimico.descripcion}</span>) : (<span className="text-muted fst-italic">Sin descripcion detallada</span>)}
                                </Col>
                            </Row>

                            <Row className="mb-2 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Estado Actual</Col>
                                <Col sm={8}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: tipoQuimico.activo ? '#dcfce7' : '#fee2e2',
                                            color: tipoQuimico.activo ? '#166534' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${tipoQuimico.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                        {tipoQuimico.activo ? 'Activo' : 'Inactivo'}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-end gap-2">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate('/tipos-quimicos')}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>
                            
                            <Button 
                                variant="primary" 
                                disabled={!tipoQuimico.activo}
                                onClick={() => navigate(`/tipos-quimicos/${tipoQuimico.id}/edit`)}
                            >
                                <i className="bi bi-pencil me-1"></i>Editar Tipo Químico
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}