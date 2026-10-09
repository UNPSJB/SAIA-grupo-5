import { Container, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { TipoDocumento } from "../types";
import { PageLoading } from "../../../components/PageLoading";


export function VerTipoDocumentoPage() {
    const navigate = useNavigate();
    const { id } = useParams(); 

    const { data: tipoDocumento, isLoading, error } = useApi<TipoDocumento>(`/tipos-documentos/${id}`);

    if (isLoading) return <PageLoading title="Detalle del Tipo Documento" />;

    if (!tipoDocumento || error) return (
        <Container>
            <PageHeader title="Tipo Documento no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrio un error al cargar los datos." : "El Tipo Documento ingresado no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <Container>
            <PageHeader title="Detalle del Tipo Documento" />

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Header className="bg-white border-bottom p-4">
                            <h5 className="mb-0 fw-bold text-primary">
                                <i className="bi bi-info-circle me-2"></i>
                                Información del Tipo Documento
                            </h5>
                        </Card.Header>
                        
                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Nombre</Col>
                                <Col sm={8} className="fs-5">{tipoDocumento.nombre}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Descripcion</Col>
                                <Col sm={8}>
                                    {tipoDocumento.descripcion ? (
                                        <span>{tipoDocumento.descripcion}</span>) : (<span className="text-muted fst-italic">Sin descripcion detallada</span>)}
                                </Col>
                            </Row>

                            <Row className="mb-2 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Estado Actual</Col>
                                <Col sm={8}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: tipoDocumento.activo ? '#dcfce7' : '#fee2e2',
                                            color: tipoDocumento.activo ? '#166534' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${tipoDocumento.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                        {tipoDocumento.activo ? 'Activo' : 'Inactivo'}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-end gap-2">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate('/tipos-documentos')}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>
                            
                            <Button 
                                variant="primary" 
                                disabled={!tipoDocumento.activo}
                                onClick={() => navigate(`/tipos-documentos/${tipoDocumento.id}/edit`)}
                            >
                                <i className="bi bi-pencil me-1"></i>Editar Tipo Documento   

                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}