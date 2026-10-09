import { Container, Spinner, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { Documento } from "../types";
import { useAuth } from '../../../hooks';
import type { VersionDocumento } from "../../VersionesDocumentos/types"; 

export function VerDocumentoPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentUser } = useAuth();
    const { data: documento, isLoading, error } = useApi<Documento>(`/documentos/${id}`);

    const isAdmin = Boolean(currentUser?.administrar);

    const { data: versiones, isLoading: cargandoVersiones } = useApi<VersionDocumento[]>(
        isAdmin ? null : `/versiones-documentos/documento/${id}`
    );
    const versionVigente = versiones?.find(v => v.vigente);



    if (isLoading) return (
        <>
            <PageHeader title="Detalle del Documento" />
            <Spinner animation="border" role="status" className="d-block mx-auto mt-5 text-primary">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    );

    if (!documento || error) return (
        <Container>
            <PageHeader title="Documento no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrio un error al cargar los datos." : "El Documento ingresado no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <Container>
            <PageHeader title="Detalle del Documento" />

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Header className="bg-white border-bottom p-4">
                            <h5 className="mb-0 fw-bold text-primary">
                                <i className="bi bi-info-circle me-2"></i>
                                Información del Documento
                            </h5>
                        </Card.Header>
                        
                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Nombre</Col>
                                <Col sm={8} className="fs-5">{documento.nombre}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Descripcion</Col>
                                <Col sm={8}>
                                    {documento.descripcion ? (
                                        <span>{documento.descripcion}</span>) : (<span className="text-muted fst-italic">Sin descripcion detallada</span>)}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Tipo de Documento</Col>
                                <Col sm={8}>{documento.tipo.nombre}</Col>
                            </Row>
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Versiones</Col>
                                <Col sm={8} className="d-flex flex-wrap gap-2">
                                    <Button
                                        variant="outline-info"
                                        size="sm"
                                        disabled={!documento.activo || (!isAdmin && (cargandoVersiones || !versionVigente))}
                                        onClick={() =>
                                            navigate(
                                                isAdmin
                                                    ? `/versiones-documentos/documento/${documento.id}`
                                                    : `/versiones-documentos/version/${versionVigente?.id}`
                                            )
                                        }
                                    >
                                        <i className="bi bi-eye me-2"></i>Ver
                                    </Button>

                                    {!isAdmin && (
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            disabled={!documento.activo}
                                            onClick={() => navigate(`/versiones-documentos/documento/${documento.id}`)}
                                        >
                                            <i className="bi bi-clock-history me-2"></i>Historial de versiones
                                        </Button>
                                    )}

                                    {!isAdmin && !cargandoVersiones && !versionVigente && (
                                        <span className="text-muted small align-self-center">Sin versión vigente</span>
                                    )}
                                </Col>
                            </Row>
                            <Row className="mb-2 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Estado Actual</Col>
                                <Col sm={8}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: documento.activo ? '#dcfce7' : '#fee2e2',
                                            color: documento.activo ? '#166534' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${documento.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                        {documento.activo ? 'Activo' : 'Inactivo'}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-end gap-2">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate('/documentos')}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>
                            {isAdmin && (
                                <Button 
                                    variant="primary" 
                                    disabled={!documento.activo}
                                    onClick={() => navigate(`/documentos/${documento.id}/edit`)}
                                >
                                    <i className="bi bi-pencil me-1"></i>Editar Documento   
                                </Button>
                            )}
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}