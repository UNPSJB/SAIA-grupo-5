import { Container, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { Proveedor } from "../types";
import { PageLoading } from "../../../components/PageLoading";

const formatearFechaAR = (fechaStr: string | null | undefined): string => {
    if (!fechaStr) return "";
    const partes = fechaStr.split("-"); 
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`; 
    }
    return fechaStr;
};

const obtenerNombreArchivo = (base64: string | null | undefined): string => {
    if (!base64) return "";
    const matchNombre = base64.match(/;name=([^;]+);base64,/);
    if (matchNombre?.[1]) {
        return decodeURIComponent(matchNombre[1]);
    }
    if (base64.startsWith("data:application/pdf")) return "Habilitacion_Sanitaria.pdf";
    if (base64.startsWith("data:image/")) return "Imagen adjunta";
    return "Documento adjunto";
};

export function VerProveedorPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: proveedor, isLoading, error } = useApi<Proveedor>(`/proveedores/${id}`);

    const tituloPagina = "Detalle del Proveedor";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!proveedor || error) return (
        <Container>
            <PageHeader title="Proveedor no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrió un error al cargar los datos." : "El proveedor ingresado no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    const esImagen = proveedor.archivo_adjunto?.startsWith("data:image/");

    return (
        <Container>
            <PageHeader title={tituloPagina} />

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Razon Social</Col>
                                <Col sm={8} className="fs-6">{proveedor.nombre}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">CUIT</Col>
                                <Col sm={8}>{proveedor.cuit}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Telefono</Col>
                                <Col sm={8}>{proveedor.telefono || <span className="text-muted fst-italic">Sin telefono</span>}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Email</Col>
                                <Col sm={8}>{proveedor.email || <span className="text-muted fst-italic">Sin email</span>}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Estado Actual</Col>
                                <Col sm={8}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: proveedor.activo ? '#dcfce7' : '#fee2e2',
                                            color: proveedor.activo ? '#166534' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${proveedor.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                        {proveedor.activo ? 'Activo' : 'Inactivo'}
                                    </div>
                                </Col>
                            </Row>

                            <div className="p-3 rounded border mt-4 bg-white shadow-sm border-secondary-subtle">
                                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                                    <h6 className="fw-bold text-primary mb-0">
                                        <i className="bi bi-shield-check me-2"></i>Habilitacion Sanitaria
                                    </h6>
                                    {!proveedor.numero_habilitacion && (
                                        <span className="badge bg-warning text-dark">Pendiente de registro</span>
                                    )}
                                </div>

                                <Row className="mb-2 align-items-center">
                                    <Col sm={4} className="fw-bold text-secondary">Numero de Habilitacion</Col>
                                    <Col sm={8}>
                                        {proveedor.numero_habilitacion ? (
                                            <span className="fw-bold">{proveedor.numero_habilitacion}</span>
                                        ) : (
                                            <span className="text-muted fst-italic">Sin registrar</span>
                                        )}
                                    </Col>
                                </Row>

                                <Row className="mb-2 align-items-center">
                                    <Col sm={4} className="fw-bold text-secondary">Fecha de Vencimiento</Col>
                                    <Col sm={8}>
                                        {proveedor.vencimiento_habilitacion ? (
                                            <span>{proveedor.vencimiento_habilitacion.split("-").reverse().join("/")}</span>
                                        ) : (
                                            <span className="text-muted fst-italic">Sin fecha de vencimiento</span>
                                        )}
                                    </Col>
                                </Row>

                                <Row className="mb-2 align-items-center">
                                    <Col sm={4} className="fw-bold text-secondary">Estado Habilitacion</Col>
                                    <Col sm={8}>
                                        {(() => {
                                            if (!proveedor.vencimiento_habilitacion) {
                                                return <span className="text-muted fst-italic">Sin habilitacion registrada</span>;
                                            }

                                            const hoy = new Date();
                                            hoy.setHours(0, 0, 0, 0);
                                            const [anio, mes, dia] = proveedor.vencimiento_habilitacion.split("-").map(Number);
                                            const fechaVenc = new Date(anio, mes - 1, dia);
                                            const diasRestantes = Math.round((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

                                            const vencido = diasRestantes <= 0;
                                            const proximo = diasRestantes > 0 && diasRestantes <= 30;
                                            const badge = vencido ? '#fee2e2' : proximo ? '#fef3c7' : '#dcfce7';
                                            const color = vencido ? '#991b1b' : proximo ? '#92400e' : '#166534';
                                            const texto = vencido
                                                ? `Vencida (${Math.abs(diasRestantes)} días)`
                                                : proximo
                                                ? `Proxima a vencer (${diasRestantes} días)`
                                                : `Vigente (${diasRestantes} días)`;

                                            return (
                                                <div
                                                    style={{
                                                        padding: '4px 14px',
                                                        borderRadius: '16px',
                                                        background: badge,
                                                        color: color,
                                                        fontWeight: 700,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {texto}
                                                </div>
                                            );
                                        })()}
                                    </Col>
                                </Row>

                                {proveedor.observacion_habilitacion && (
                                    <Row className="mb-2 align-items-start pt-2 border-top">
                                        <Col sm={4} className="fw-bold text-secondary">Observaciones</Col>
                                        <Col sm={8} className="text-muted">{proveedor.observacion_habilitacion}</Col>
                                    </Row>
                                )}

                                {proveedor.archivo_adjunto && (
                                    <Row className="align-items-center pt-2 border-top mt-2">
                                        <Col sm={4} className="fw-bold text-secondary">Comprobante Adjunto</Col>
                                        <Col sm={8}>
                                            {esImagen ? (
                                                <div>
                                                    <img
                                                        src={proveedor.archivo_adjunto}
                                                        alt="Comprobante"
                                                        style={{ maxHeight: '160px', borderRadius: '8px', objectFit: 'contain' }}
                                                        className="border shadow-sm p-1"
                                                    />
                                                    <div className="small text-muted mt-1">{obtenerNombreArchivo(proveedor.archivo_adjunto)}</div>
                                                </div>
                                            ) : (
                                                <div className="p-2 px-3 border rounded bg-light d-inline-flex align-items-center gap-2">
                                                    <i className="bi bi-file-earmark-pdf-fill text-danger fs-4"></i>
                                                    <span className="fw-semibold">{obtenerNombreArchivo(proveedor.archivo_adjunto)}</span>
                                                    <a
                                                        href={proveedor.archivo_adjunto}
                                                        download={obtenerNombreArchivo(proveedor.archivo_adjunto)}
                                                        className="btn btn-outline-primary btn-sm ms-2"
                                                    >
                                                        <i className="bi bi-download me-1"></i>Descargar
                                                    </a>
                                                </div>
                                            )}
                                        </Col>
                                    </Row>
                                )}
                            </div>
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-start gap-2">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate('/proveedores')}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>
                            
                            <Button 
                                variant="primary" 
                                disabled={!proveedor.activo}
                                onClick={() => navigate(`/proveedores/${proveedor.id}/edit`)}
                            >
                                <i className="bi bi-pencil me-1"></i>Editar Proveedor
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}