import { Container, Spinner, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { VencimientoPersonal } from "../types";
import type { ConfiguracionSistema } from "../../ConfiguracionSistema/types";
import { PageLoading } from "../../../components/PageLoading";

const obtenerNombreArchivo = (base64: string | null | undefined): string => {
    if (!base64) return "";

    const matchNombre = base64.match(/;name=([^;]+);base64,/);      // Esto busca adentro del texto Base64 si esta guardado la parte ';name=([^;]+);base64,' y saca lo que esta en el medio que es el nombre del archivo

    if (matchNombre?.[1]) {
        return decodeURIComponent(matchNombre[1]);      // Convierte los espacios o acentos en texto normal para que se vea bien en la pantalla.
    }

    {/* Estos if y return son por si entras al editar y no seleccionaste otro archivo */}
    if (base64.startsWith("data:application/pdf")) return "Documento PDF adjunto.pdf";      
    if (base64.startsWith("data:image/")) return "Imagen adjunta";
    return "Documento adjunto";
};

export function VerVencimientoPersonalPage() {
    const navigate = useNavigate();
    const locacion = useLocation();
    const { id } = useParams();

    const { data: vencimiento, isLoading, error } = useApi<VencimientoPersonal>(`/vencimiento-personal/${id}`);
    const { data: configuracion } = useApi<ConfiguracionSistema>('/configuracion-sistema/');
    const diasAntelacion = configuracion?.dias_antelacion_vencimiento ?? 15;

    const tituloPagina = "Detalle del Vencimiento";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!vencimiento || error) return (
        <Container>
            <PageHeader title="Vencimiento no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrió un error al cargar los datos." : "El Vencimiento ingresado no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    const rutaVolver = locacion.state?.rutaVolver || `/personal/${vencimiento.persona_id}/vencimientos`;

    const vencido = vencimiento.dias_restantes <= 0;
    const proximo = vencimiento.dias_restantes > 0 && vencimiento.dias_restantes <= diasAntelacion;
    const badge = vencido ? '#fee2e2' : proximo ? '#fef3c7' : '#dcfce7';
    const color = vencido ? '#991b1b' : proximo ? '#92400e' : '#166534';
    const textoEstado = vencido
        ? `Vencido (${Math.abs(vencimiento.dias_restantes)} dias)`
        : proximo
        ? `Proximo a vencer (${vencimiento.dias_restantes} dias)`
        : `Vigente (${vencimiento.dias_restantes} dias)`;

    return (
        <Container>
            <PageHeader title={tituloPagina} />

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">

                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Persona</Col>
                                <Col sm={8} className="fs-6">
                                    {vencimiento.persona.nombre} {vencimiento.persona.apellido}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Tipo de Vencimiento</Col>
                                <Col sm={8}>{vencimiento.tipo_vencimiento.nombre}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Fecha de Carga</Col>
                                <Col sm={8}>{new Date(vencimiento.fecha_carga).toLocaleString("es-AR")}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Fecha Desde</Col>
                                <Col sm={8}>{vencimiento.fecha_desde.split("-").reverse().join("/")}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Fecha Hasta (Vencimiento)</Col>
                                <Col sm={8}>{vencimiento.fecha_hasta.split("-").reverse().join("/")}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Estado Actual</Col>
                                <Col sm={8}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: badge,
                                            color: color,
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {textoEstado}
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Observacion</Col>
                                <Col sm={8}>
                                    {vencimiento.observacion ? (
                                        <span>{vencimiento.observacion}</span>
                                    ) : (
                                        <span className="text-muted fst-italic">Sin observacion detallada</span>
                                    )}
                                </Col>
                            </Row>
                            
                            {/* Para el archivo adjunto preguntamos si existe, si no tiene nada cargado se muestra un texto, sino se comprueba si es una foto para mostrarla y si no lo es se deja descargar el archivo */}
                            <Row className="mb-2 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Comprobante / Archivo</Col>
                                <Col sm={8}>
                                    {vencimiento.archivo_adjunto ? (
                                        <div>
                                            {vencimiento.archivo_adjunto.startsWith("data:image/") ? (
                                                <div className="mb-2">
                                                    <img
                                                        src={vencimiento.archivo_adjunto}
                                                        alt="Comprobante"
                                                        style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px' }}
                                                        className="border shadow-sm"
                                                    />
                                                    <div className="small text-muted mt-1">
                                                        {obtenerNombreArchivo(vencimiento.archivo_adjunto)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mb-2">
                                                    <span className="badge bg-light text-dark border p-2">
                                                        <i className="bi bi-file-earmark-text text-success me-1"></i>
                                                        {obtenerNombreArchivo(vencimiento.archivo_adjunto)}
                                                    </span>
                                                </div>
                                            )}
                                            <a
                                                href={vencimiento.archivo_adjunto}
                                                download={`vencimiento_${vencimiento.persona.apellido}_${vencimiento.tipo_vencimiento.nombre}_${vencimiento.fecha_desde.split("-").reverse().join("/")}`}
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                <i className="bi bi-download me-1"></i>Descargar Archivo Adjunto
                                            </a>
                                        </div>
                                    ) : (
                                        <span className="text-muted fst-italic">Sin archivo adjunto</span>
                                    )}
                                </Col>
                            </Row>
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-end gap-2">
                            <Button
                                variant="outline-secondary"
                                onClick={() => navigate(rutaVolver)}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>

                            <Button
                                variant="primary"
                                disabled={!vencimiento.persona?.activo}
                                onClick={() => navigate(`/vencimiento-personal/${vencimiento.id}/edit`, { state: locacion.state })}
                            >
                                <i className="bi bi-pencil me-1"></i>Editar Vencimiento
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}