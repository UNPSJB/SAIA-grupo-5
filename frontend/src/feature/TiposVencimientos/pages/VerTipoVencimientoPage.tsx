import { Container, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { TipoVencimiento } from "../types";
import { PageLoading } from "../../../components/PageLoading";
import { Dato } from "../../../components/Dato";
import { EstadoBadge } from "../../../components/EstadoBadge";

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

            <Card className="shadow-sm border-0 rounded-3 mb-4 mt-3 text-start">
                <Card.Body className="p-4">
                    <h6 className="detalle-seccion-titulo">Datos del tipo de vencimiento</h6>
                    <Row className="g-3">
                        <Dato etiqueta="Nombre" md={8}>
                            <span className="fw-semibold">{tipoVencimiento.nombre}</span>
                        </Dato>
                        <Dato etiqueta="Estado Actual" md={4}>
                            <EstadoBadge
                                tono={tipoVencimiento.activo ? 'success' : 'danger'}
                                icono={tipoVencimiento.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}
                            >
                                {tipoVencimiento.activo ? 'Activo' : 'Inactivo'}
                            </EstadoBadge>
                        </Dato>
                        <Dato etiqueta="Descripción">
                            {tipoVencimiento.descripcion || <span className="text-muted fst-italic">Sin descripción detallada</span>}
                        </Dato>
                    </Row>
                </Card.Body>
            </Card>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
                <Button variant="outline-secondary" onClick={() => navigate('/tipos-vencimientos')}>
                    <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                </Button>
                <Button
                    variant="primary"
                    disabled={!tipoVencimiento.activo}
                    onClick={() => navigate(`/tipos-vencimientos/${tipoVencimiento.id}/edit`)}
                >
                    <i className="bi bi-pencil me-1"></i>Editar Tipo Vencimiento
                </Button>
            </div>
        </Container>
    );
}
