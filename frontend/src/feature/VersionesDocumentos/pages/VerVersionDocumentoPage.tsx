import { Container, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { useState } from "react";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { VersionDocumento } from "../types";
import { MarcarVigenteModal } from "../components/MarcarVigenteModal";
import { useAuth } from '../../../hooks';
import { PageLoading } from "../../../components/PageLoading";
import { Dato } from "../../../components/Dato";
import { EstadoBadge, type TonoEstado } from "../../../components/EstadoBadge";


const formatearFechaHora = (fecha?: string | null) =>
    fecha ? new Date(fecha).toLocaleString('es-AR') : '-';

const obtenerNombreArchivo = (base64: string | null | undefined): string => {
    if (!base64) return "";

    const matchNombre = base64.match(/;name=([^;]+);base64,/);      // Esto busca adentro del texto Base64 si esta guardado la parte ';name=([^;]+);base64,' y saca lo que esta en el medio que es el nombre del archivo

    if (matchNombre?.[1]) {
        return decodeURIComponent(matchNombre[1]);      // Convierte los espacios o acentos en texto normal para que se vea bien en la pantalla.
    }

    {/* Estos if y return son por si entras al editar y no seleccionaste otro archivo */}
    if (base64.startsWith("data:application/pdf")) return "Version Documento PDF.pdf";      
    return "Version Documento";
};

export function VerVersionDocumentoPage() {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const { data: version, isLoading, error } = useApi<VersionDocumento>(`/versiones-documentos/${id}`);
    const { data: documento } = useApi<{ nombre: string }>( version ? `/documentos/${version.documento_id}` : "");
    const { data: versionesDelDocumento } = useApi<VersionDocumento[]>(
        version ? `/versiones-documentos/documento/${version.documento_id}` : ""
    );
    const [versionAMarcar, setVersionAMarcar] = useState<VersionDocumento | null>(null);
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

    const estadoVigencia: { label: string; tono: TonoEstado; icono: string } = version.vigente
        ? { label: 'Vigente', tono: 'info', icono: 'bi-check-circle-fill' }
        : version.fecha_hasta_vigencia
            ? { label: 'Histórica', tono: 'secondary', icono: 'bi-clock-history' }
            : { label: 'Sin vigencia', tono: 'warning', icono: 'bi-dash-circle-fill' };

    const recargar = () => Promise.all([
        mutate(`/versiones-documentos/${id}`),
        mutate(`/versiones-documentos/documento/${version.documento_id}`),
    ]);

    return (
        <Container>
            <PageHeader title="Detalle de la Versión" />

            <Card className="shadow-sm border-0 rounded-3 mb-4 mt-3 text-start">
                <Card.Body className="p-4">
                    <h6 className="detalle-seccion-titulo">Datos de la versión</h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta="Documento" md={6} lg={3}>
                            <span className="fw-semibold">{documento?.nombre || "Cargando..."}</span>
                        </Dato>
                        <Dato etiqueta="Versión" md={6} lg={3}>
                            <span className="fw-bold">{version.version}</span>
                        </Dato>
                        <Dato etiqueta="Fecha de carga" md={6} lg={3}>{version.fecha_subida}</Dato>
                        <Dato etiqueta="Estado Actual" md={6} lg={3}>
                            <EstadoBadge
                                tono={version.activo ? 'success' : 'danger'}
                                icono={version.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}
                            >
                                {version.activo ? 'Activo' : 'Inactivo'}
                            </EstadoBadge>
                        </Dato>
                        <Dato etiqueta="Observación">
                            {version.observacion || <span className="text-muted fst-italic">Sin observación detallada</span>}
                        </Dato>
                    </Row>

                    <h6 className="detalle-seccion-titulo">Vigencia</h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta="Vigencia" md={6} lg={3}>
                            <EstadoBadge tono={estadoVigencia.tono} icono={estadoVigencia.icono}>
                                {estadoVigencia.label}
                            </EstadoBadge>
                        </Dato>
                        <Dato etiqueta="Vigente desde" md={6} lg={3}>{formatearFechaHora(version.fecha_desde_vigencia)}</Dato>
                        <Dato etiqueta="Vigente hasta" md={6} lg={3}>
                            {version.fecha_hasta_vigencia
                                ? formatearFechaHora(version.fecha_hasta_vigencia)
                                : <span className="text-muted fst-italic">-</span>}
                        </Dato>
                        <Dato etiqueta="Marcada vigente por" md={6} lg={3}>
                            {version.aprobador
                                ? `${version.aprobador.nombre} ${version.aprobador.apellido}`
                                : <span className="text-muted fst-italic">-</span>}
                        </Dato>
                    </Row>

                    <h6 className="detalle-seccion-titulo">Archivo</h6>
                    <div className="d-flex flex-wrap align-items-center gap-2">
                        <span className="badge bg-light text-dark border p-2">
                            <i className="bi bi-file-earmark-text text-success me-1"></i>
                            {obtenerNombreArchivo(version.archivo)}
                        </span>
                        <a
                            href={version.archivo}
                            download={`documento_${documento?.nombre}_version_${version.version}`}
                            className="btn btn-outline-primary btn-sm"
                        >
                            <i className="bi bi-download me-1"></i>Descargar Archivo
                        </a>
                    </div>
                </Card.Body>
            </Card>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
                <Button
                    variant="outline-secondary"
                    onClick={() => navigate(isAdmin ? `/versiones-documentos/documento/${version.documento_id}` : '/documentos/')}
                >
                    <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                </Button>
                {isAdmin && !version.fecha_hasta_vigencia && (
                    <Button
                        variant="primary"
                        disabled={!version.activo}
                        onClick={() => navigate(`/versiones-documentos/version/${version.id}/edit`)}
                    >
                        <i className="bi bi-pencil me-1"></i>Editar Versión
                    </Button>
                )}
                {isAdmin && !version.vigente && !version.fecha_hasta_vigencia && (
                    <Button
                        variant="success"
                        disabled={!version.activo}
                        onClick={() => setVersionAMarcar(version)}
                    >
                        <i className="bi bi-patch-check me-1"></i>Marcar Vigente
                    </Button>
                )}
            </div>

            <MarcarVigenteModal
                version={versionAMarcar}
                versionVigenteActual={versionesDelDocumento?.find(v => v.vigente)}
                onHide={() => setVersionAMarcar(null)}
                onMarked={recargar}
            />
        </Container>
    );
}
