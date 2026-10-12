import { Container, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { Persona } from "../types";
import { PageLoading } from "../../../components/PageLoading";
import { Capacidades } from '../../Capacidades/types'

const capacidadLabels: Record<string, string> = {
    [Capacidades.OPERAR]: 'Operar',
    [Capacidades.ADMINISTRAR]: 'Administrar',
};

export function VerPersonalPage() {
    const navigate = useNavigate();
    const { id } = useParams(); 

    const { data: persona, isLoading, error } = useApi<Persona>(`/personal/${id}`);

    const tituloPagina = "Detalle del Personal";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!persona || error) return (
        <Container>
            <PageHeader title="Personal no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrio un error al cargar los datos." : "El Personal ingresado no existe."}
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
                                <Col sm={4} className="fw-bold text-secondary">Nombre Completo</Col>
                                <Col sm={8} className="fs-6">{persona.nombre} {persona.apellido}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">DNI</Col>
                                <Col sm={8}>
                                    {persona.dni}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Correo electroncio</Col>
                                <Col sm={8}>
                                    {persona.mail}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Nombre de usuario</Col>
                                <Col sm={8}>
                                    {persona.username}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Capacidades</Col>
                                <Col sm={8}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                        {!persona.capacidades || persona.capacidades.length === 0 ? (
                                            <span className="text-muted fst-italic">Sin capacidades</span>
                                        ) : (
                                            persona.capacidades.map((capacidad) => (
                                                <div
                                                    key={capacidad}
                                                    style={{
                                                        padding: '3px 10px',
                                                        borderRadius: '14px',
                                                        background: capacidad === Capacidades.ADMINISTRAR ? '#dbeafe' : '#e5e7eb',
                                                        color: capacidad === Capacidades.ADMINISTRAR ? '#1d4ed8' : '#374151',
                                                        fontWeight: 600,
                                                        fontSize: '0.85rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {capacidadLabels[capacidad] ?? capacidad}
                                                </div>
                                            ))
                                        )}
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
                                            background: persona.activo ? '#dcfce7' : '#fee2e2',
                                            color: persona.activo ? '#166534' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${persona.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                        {persona.activo ? 'Activo' : 'Inactivo'}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-end gap-2">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate('/personal')}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>
                            
                            <Button 
                                variant="primary" 
                                disabled={!persona.activo}
                                onClick={() => navigate(`/personal/${persona.id}/edit`)}
                            >
                                <i className="bi bi-pencil me-1"></i>Editar Personal   

                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}