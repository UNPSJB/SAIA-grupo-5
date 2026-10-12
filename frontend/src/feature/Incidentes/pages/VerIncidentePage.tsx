import { Container, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { Incidente } from "../types";
import { useAuth } from '../../../hooks';
import { PageLoading } from "../../../components/PageLoading";

export function VerIncidentePage() {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const { data: incidente, isLoading, error } = useApi<Incidente>(`/incidentes/${id}`);
    const { currentUser } = useAuth();
    const isAdmin = Boolean(currentUser?.administrar);

    if (isLoading) return <PageLoading title="Detalle del Incidente" />;


    if (!incidente || error) return (
        <Container>
            <PageHeader title="Incidente no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrio un error al cargar los datos." : "El Incidente ingresado no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <Container>
            <PageHeader title="Detalle del Incidente" />

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Header className="bg-white border-bottom p-4">
                            <h5 className="mb-0 fw-bold text-primary">
                                <i className="bi bi-info-circle me-2"></i>
                                Información del Incidente
                            </h5>
                        </Card.Header>

                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Incidente</Col>
                                <Col sm={8} className="fs-5">{incidente?.nombre || "Cargando..."}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Tipo Incidente</Col>
                                <Col sm={8}>{incidente?.tipo.nombre || "Cargando..."}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Reportado por</Col>
                                <Col sm={8}>
                                    {incidente.operario?.nombre || "Sin datos del reportante"}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Descripción</Col>
                                <Col sm={8}>{incidente.descripcion}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Sector</Col>
                                <Col sm={8}>
                                    {incidente.sector?.nombre || "Sin sector asignado"}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Fecha de apertura</Col>
                                <Col sm={8}>
                                    {incidente.fecha_abierto
                                        ? new Date(incidente.fecha_abierto).toLocaleString("es-AR", {
                                            hour12: false,
                                        })
                                        : ""}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Fecha de cierre</Col>
                                <Col sm={8}>
                                    {incidente.fecha_cierre
                                        ? new Date(incidente.fecha_cierre).toLocaleString("es-AR", {
                                            hour12: false,
                                        })
                                        : "Sin cerrar"}
                                </Col>
                            </Row>

                            <Row className="mb-2 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">
                                    Estado del incidente
                                </Col>
                                <Col sm={8}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: incidente.estado === "Abierto" ? '#dce7fc' : '#fee2e2',
                                            color: incidente.estado === "Abierto" ? '#163f65' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${incidente.estado === "Abierto" ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                        {incidente.estado}
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
                                            background: incidente.activo ? '#dcfce7' : '#fee2e2',
                                            color: incidente.activo ? '#166534' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${incidente.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                        {incidente.activo ? 'Activo' : 'Inactivo'}
                                    </div>
                                </Col>
                            </Row>

                            {incidente.foto_opcional && (
                                <Row className="mt-4">
                                    <Col>
                                        <h6 className="fw-bold text-secondary mb-3">Foto</h6>
                                        <img
                                            src={incidente.foto_opcional}
                                            alt="Foto del incidente"
                                            className="img-fluid border rounded"
                                            style={{ maxHeight: "600px", objectFit: "contain" }}
                                        />
                                    </Col>
                                </Row>
                            )}
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-end gap-2">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate("/incidentes/")}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>
                            {isAdmin && (
                                <Button 
                                    variant="primary" 
                                    disabled={!incidente.activo}
                                    onClick={() => navigate(`/incidentes/${incidente.id}/edit`)}
                                >
                                    <i className="bi bi-pencil me-1"></i>Editar Incidente   

                                </Button>
                            )}
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}