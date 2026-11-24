import { Container, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { Documento } from "../types";
import { useAuth } from '../../../hooks';
import type { VersionDocumento } from "../../VersionesDocumentos/types"; 
import { PageLoading } from "../../../components/PageLoading";
import { Dato } from "../../../components/Dato";
import { EstadoBadge } from "../../../components/EstadoBadge";


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



    if (isLoading) return <PageLoading title="Detalle del Documento" />;


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

            <Card data-tour="info-documento" className="shadow-sm border-0 rounded-3 mb-4 mt-3 text-start">
                <Card.Body className="p-4">
                    <h6 className="detalle-seccion-titulo">Datos del documento</h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta="Nombre" md={6} lg={4}>
                            <span className="fw-semibold">{documento.nombre}</span>
                        </Dato>
                        <Dato etiqueta="Tipo de Documento" md={6} lg={4}>{documento.tipo.nombre}</Dato>
                        <Dato etiqueta="Estado Actual" md={6} lg={4}>
                            <EstadoBadge
                                tono={documento.activo ? 'success' : 'danger'}
                                icono={documento.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}
                            >
                                {documento.activo ? 'Activo' : 'Inactivo'}
                            </EstadoBadge>
                        </Dato>
                        <Dato etiqueta="Descripción">
                            {documento.descripcion || <span className="text-muted fst-italic">Sin descripción detallada</span>}
                        </Dato>
                    </Row>

                    <h6 className="detalle-seccion-titulo">Versiones</h6>
                    <div className="d-flex flex-wrap align-items-center gap-2">
                        <Button
                            data-tour={isAdmin ? 'btn-historial-versiones' : undefined}
                            variant="outline-primary"
                            disabled={!documento.activo || (!isAdmin && (cargandoVersiones || !versionVigente))}
                            onClick={() =>
                                navigate(
                                    isAdmin
                                        ? `/versiones-documentos/documento/${documento.id}`
                                        : `/versiones-documentos/version/${versionVigente?.id}`
                                )
                            }
                        >
                            <i className="bi bi-eye me-2"></i>{isAdmin ? 'Ver versiones' : 'Ver versión vigente'}
                        </Button>

                        {!isAdmin && (
                            <Button
                                data-tour="btn-historial-versiones"
                                variant="outline-secondary"
                                disabled={!documento.activo}
                                onClick={() => navigate(`/versiones-documentos/documento/${documento.id}`)}
                            >
                                <i className="bi bi-clock-history me-2"></i>Historial de versiones
                            </Button>
                        )}

                        {!isAdmin && !cargandoVersiones && !versionVigente && (
                            <span className="text-muted small">Sin versión vigente</span>
                        )}
                    </div>
                </Card.Body>
            </Card>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
                <Button variant="outline-secondary" onClick={() => navigate('/documentos')}>
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
            </div>
        </Container>
    );
}
