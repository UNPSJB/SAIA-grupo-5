import { Container, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { TipoIncidente } from "../types";
import { PageLoading } from "../../../components/PageLoading";
import { Dato } from "../../../components/Dato";
import { EstadoBadge } from "../../../components/EstadoBadge";


export function VerTipoIncidentePage() {
    const navigate = useNavigate();
    const { id } = useParams(); 

    const { data: tipoIncidente, isLoading, error } = useApi<TipoIncidente>(`/tipos-incidentes/${id}`);

    if (isLoading) return <PageLoading title="Detalle del Tipo Incidente" />;

    if (!tipoIncidente || error) return (
        <Container>
            <PageHeader title="Tipo Incidente no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrio un error al cargar los datos." : "El Tipo Incidente ingresado no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <Container>
            <PageHeader title="Detalle del Tipo Incidente" />

            <Card className="shadow-sm border-0 rounded-3 mb-4 mt-3 text-start">
                <Card.Body className="p-4">
                    <h6 className="detalle-seccion-titulo">Datos del tipo de incidente</h6>
                    <Row className="g-3">
                        <Dato etiqueta="Nombre" md={8}>
                            <span className="fw-semibold">{tipoIncidente.nombre}</span>
                        </Dato>
                        <Dato etiqueta="Estado Actual" md={4}>
                            <EstadoBadge
                                tono={tipoIncidente.activo ? 'success' : 'danger'}
                                icono={tipoIncidente.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}
                            >
                                {tipoIncidente.activo ? 'Activo' : 'Inactivo'}
                            </EstadoBadge>
                        </Dato>
                        <Dato etiqueta="Descripción">
                            {tipoIncidente.descripcion || <span className="text-muted fst-italic">Sin descripción detallada</span>}
                        </Dato>
                    </Row>
                </Card.Body>
            </Card>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
                <Button variant="outline-secondary" onClick={() => navigate('/tipos-incidentes')}>
                    <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                </Button>
                <Button
                    variant="primary"
                    disabled={!tipoIncidente.activo}
                    onClick={() => navigate(`/tipos-incidentes/${tipoIncidente.id}/edit`)}
                >
                    <i className="bi bi-pencil me-1"></i>Editar Tipo Incidente
                </Button>
            </div>
        </Container>
    );
}
