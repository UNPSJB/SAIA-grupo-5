import { Container, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { Persona } from "../types";
import { PageLoading } from "../../../components/PageLoading";
import { Dato } from "../../../components/Dato";
import { EstadoBadge, type TonoEstado } from "../../../components/EstadoBadge";
import { Capacidades } from '../../Capacidades/types'

const capacidadLabels: Record<string, string> = {
    [Capacidades.OPERAR]: 'Operar',
    [Capacidades.ADMINISTRAR]: 'Administrar',
    [Capacidades.SUPERVISOR]: 'Supervisor',
};

const capacidadTonos: Record<string, TonoEstado> = {
    [Capacidades.OPERAR]: 'secondary',
    [Capacidades.ADMINISTRAR]: 'info',
    [Capacidades.SUPERVISOR]: 'warning',
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

            <Card className="shadow-sm border-0 rounded-3 mb-4 mt-3 text-start">
                <Card.Body className="p-4">
                    <h6 className="detalle-seccion-titulo">Datos personales</h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta="Nombre Completo" md={6} lg={4}>
                            <span className="fw-semibold">{persona.nombre} {persona.apellido}</span>
                        </Dato>
                        <Dato etiqueta="DNI" md={6} lg={4}>{persona.dni}</Dato>
                        <Dato etiqueta="Correo electrónico" md={12} lg={4}>{persona.mail}</Dato>
                    </Row>

                    <h6 className="detalle-seccion-titulo">Cuenta y permisos</h6>
                    <Row className="g-3">
                        <Dato etiqueta="Nombre de usuario" md={6} lg={4}>{persona.username}</Dato>
                        <Dato etiqueta="Capacidades" md={6} lg={4}>
                            {!persona.capacidades || persona.capacidades.length === 0 ? (
                                <span className="text-muted fst-italic">Sin capacidades</span>
                            ) : (
                                <div className="d-flex flex-wrap gap-2">
                                    {persona.capacidades.map((capacidad) => (
                                        <EstadoBadge key={capacidad} tono={capacidadTonos[capacidad] ?? 'secondary'}>
                                            {capacidadLabels[capacidad] ?? capacidad}
                                        </EstadoBadge>
                                    ))}
                                </div>
                            )}
                        </Dato>
                        <Dato etiqueta="Estado Actual" md={6} lg={4}>
                            <EstadoBadge
                                tono={persona.activo ? 'success' : 'danger'}
                                icono={persona.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}
                            >
                                {persona.activo ? 'Activo' : 'Inactivo'}
                            </EstadoBadge>
                        </Dato>
                    </Row>
                </Card.Body>
            </Card>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
                <Button variant="outline-secondary" onClick={() => navigate('/personal')}>
                    <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                </Button>
                <Button
                    variant="primary"
                    disabled={!persona.activo}
                    onClick={() => navigate(`/personal/${persona.id}/edit`)}
                >
                    <i className="bi bi-pencil me-1"></i>Editar Personal
                </Button>
            </div>
        </Container>
    );
}
