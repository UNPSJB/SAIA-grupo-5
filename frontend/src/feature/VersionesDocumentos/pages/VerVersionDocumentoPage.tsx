import { Container, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { VersionDocumento } from "../types";
import { useAuth } from '../../../hooks';
import { PageLoading } from "../../../components/PageLoading";


export function VerVersionDocumentoPage() {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const { data: version, isLoading, error } = useApi<VersionDocumento>(`/versiones-documentos/${id}`);
    const { data: documento } = useApi<{ nombre: string }>( version ? `/documentos/${version.documento_id}` : "");
    const { currentUser } = useAuth();
    const isAdmin = Boolean(currentUser?.administrar);

    if (isLoading) return <PageLoading title="Detalle de la Versión" />;


    if (!version || error) return (
        <Container>
            <PageHeader title="Versión no encontrada." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrio un error al cargar los datos." : "La Versión ingresada no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <Container>
            <PageHeader title="Detalle de la Versión" />

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Header className="bg-white border-bottom p-4">
                            <h5 className="mb-0 fw-bold text-primary">
                                <i className="bi bi-info-circle me-2"></i>
                                Información de la Versión
                            </h5>
                        </Card.Header>

                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Documento</Col>
                                <Col sm={8} className="fs-5">{documento?.nombre || "Cargando..."}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Version</Col>
                                <Col sm={8} className="fs-5">{version.version}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Observación</Col>
                                <Col sm={8}>
                                    {version.observacion ? (
                                        <span>{version.observacion}</span>) : (<span className="text-muted fst-italic">Sin observacion detallada</span>)}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Fecha de carga</Col>
                                <Col sm={8}>{version.fecha_subida}</Col>
                            </Row>

                            <Row className="mb-2 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Vigente</Col>
                                <Col sm={8}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: version.vigente ? '#dcf2fc' : '#fee2e2',
                                            color: version.vigente ? '#163b65' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${version.vigente ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                        {version.vigente? 'Vigente' : 'No vigente'}
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
                                            background: version.activo ? '#dcfce7' : '#fee2e2',
                                            color: version.activo ? '#166534' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${version.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                        {version.activo ? 'Activo' : 'Inactivo'}
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mt-4">
                                <Col>
                                    <h6 className="fw-bold text-secondary mb-3"> Archivo PDF </h6>
                                    <iframe
                                        src={version.archivo}
                                        title="Archivo PDF"
                                        width="100%"
                                        height="600px"
                                        className="border rounded"
                                    />
                                </Col>
                            </Row>
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-end gap-2">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate(`/versiones-documentos/documento/${version.documento_id}`)}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>
                            {isAdmin && (
                                <Button 
                                    variant="primary" 
                                    disabled={!version.activo}
                                    onClick={() => navigate(`/versiones-documentos/version/${version.id}/edit`)}
                                >
                                    <i className="bi bi-pencil me-1"></i>Editar Version   

                                </Button>
                            )}
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}