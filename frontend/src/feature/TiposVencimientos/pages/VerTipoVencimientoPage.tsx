import { Container, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { TipoVencimiento } from "../types";
import { PageLoading } from "../../../components/PageLoading";

export function VerTipoVencimientoPage() {
    const navigate = useNavigate();
    const { id } = useParams(); 

    const { data: tipoVencimiento, isLoading, error } = useApi<TipoVencimiento>(`/tipos-vencimientos/${id}`);

    const tituloPagina = "Detalle del Tipo Vencimiento";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!tipoVencimiento || error) return (
        <Container>
            <PageHeader title="Tipo Vencimiento no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrio un error al cargar los datos." : "El Tipo Vencimiento ingresado no existe."}
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
                                <Col sm={8} className="fs-6">{tipoVencimiento.nombre}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Descripcion</Col>
                                <Col sm={8}>
                                    {tipoVencimiento.descripcion ? (
                                        <span>{tipoVencimiento.descripcion}</span>) : (<span className="text-muted fst-italic">Sin descripcion detallada</span>)}
                                </Col>
                            </Row>

                            <Row className="mb-2 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Estado Actual</Col>
                                <Col sm={8}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: tipoVencimiento.activo ? '#dcfce7' : '#fee2e2',
                                            color: tipoVencimiento.activo ? '#166534' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${tipoVencimiento.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                        {tipoVencimiento.activo ? 'Activo' : 'Inactivo'}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-end gap-2">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate('/tipos-vencimientos')}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>
                            
                            <Button 
                                variant="primary" 
                                disabled={!tipoVencimiento.activo}
                                onClick={() => navigate(`/tipos-vencimientos/${tipoVencimiento.id}/edit`)}
                            >
                                <i className="bi bi-pencil me-1"></i>Editar Tipo Vencimiento   

                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}