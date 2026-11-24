import { Container, Alert, Row, Col, Card, Button, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { Proveedor } from "../types";
import { PageLoading } from "../../../components/PageLoading";
import { Dato } from "../../../components/Dato";
import { EstadoBadge } from "../../../components/EstadoBadge";
import { VencimientoBadge } from "../../../components/VencimientoBadge";
import { useState } from "react";
import { mutate } from "swr";
import { useAuth } from "../../../hooks/useAuth";
import { AsociarInsumosProveedorModal } from "../components/AsociarInsumosProveedorModal";

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
    const { currentUser } = useAuth();
    const [mostrarModalInsumos, setMostrarModalInsumos] = useState(false);

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

    const insumosSuministrados = proveedor.insumos_asociados ?? [];
    const puedeAsociar = currentUser?.administrar && proveedor.activo;

    return (
        <Container>
            <PageHeader title={tituloPagina} />

            <Card className="shadow-sm border-0 rounded-3 mb-4 mt-3 text-start">
                <Card.Body className="p-4">
                    <h6 className="detalle-seccion-titulo">Datos generales</h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta="Razón Social" lg={6}>
                            <span className="fw-semibold">{proveedor.nombre}</span>
                        </Dato>
                        <Dato etiqueta="CUIT" md={6} lg={3}>{proveedor.cuit}</Dato>
                        <Dato etiqueta="Estado Actual" md={6} lg={3}>
                            <EstadoBadge tono={proveedor.activo ? 'success' : 'danger'} icono={proveedor.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}>
                                {proveedor.activo ? 'Activo' : 'Inactivo'}
                                </EstadoBadge>
                        </Dato>
                        <Dato etiqueta="Teléfono" md={6}>
                            {proveedor.telefono || <span className="text-muted fst-italic">Sin teléfono</span>}
                        </Dato>
                        <Dato etiqueta="Email" md={6}>
                            {proveedor.email || <span className="text-muted fst-italic">Sin email</span>}
                        </Dato>
                    </Row>

                    <h6 className="detalle-seccion-titulo d-flex justify-content-between align-items-center gap-2">
                        Habilitación Sanitaria
                        {!proveedor.numero_habilitacion && (
                            <span className="badge bg-warning text-dark">Pendiente de registro</span>
                        )}
                    </h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta="Número de Habilitación" md={4}>
                            {proveedor.numero_habilitacion
                                ? <span className="fw-bold">{proveedor.numero_habilitacion}</span>
                                : <span className="text-muted fst-italic">Sin registrar</span>}
                        </Dato>
                        <Dato etiqueta="Fecha de Vencimiento" md={4}>
                            {proveedor.vencimiento_habilitacion
                                ? proveedor.vencimiento_habilitacion.split("-").reverse().join("/")
                                : <span className="text-muted fst-italic">Sin fecha de vencimiento</span>}
                        </Dato>
                        <Dato etiqueta="Estado Habilitación" md={4}>
                            <VencimientoBadge fecha={proveedor.vencimiento_habilitacion} femenino sinFecha="Sin habilitación registrada" />
                        </Dato>
                        {proveedor.observacion_habilitacion && (
                            <Dato etiqueta="Observaciones" lg={proveedor.archivo_adjunto ? 6 : 12}>
                                <span className="text-muted">{proveedor.observacion_habilitacion}</span>
                            </Dato>
                        )}
                        {proveedor.archivo_adjunto && (
                            <Dato etiqueta="Comprobante Adjunto" lg={proveedor.observacion_habilitacion ? 6 : 12}>
                                {esImagen ? (
                                    <div>
                                        <img
                                            src={proveedor.archivo_adjunto}
                                            alt="Comprobante"
                                            style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }}
                                            className="border shadow-sm p-1"
                                        />
                                        <div className="small text-muted mt-1">{obtenerNombreArchivo(proveedor.archivo_adjunto)}</div>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                        <i className="bi bi-file-earmark-pdf-fill text-danger fs-4"></i>
                                        <span className="fw-semibold">{obtenerNombreArchivo(proveedor.archivo_adjunto)}</span>
                                        <a
                                            href={proveedor.archivo_adjunto}
                                            download={obtenerNombreArchivo(proveedor.archivo_adjunto)}
                                            className="btn btn-outline-primary btn-sm"
                                        >
                                            <i className="bi bi-download me-1"></i>Descargar
                                        </a>
                                    </div>
                                )}
                            </Dato>
                        )}
                    </Row>

                    <h6 className="detalle-seccion-titulo d-flex justify-content-between align-items-center gap-2">
                        Insumos que provee
                        {puedeAsociar && (
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => setMostrarModalInsumos(true)}
                            >
                                <i className={`bi ${insumosSuministrados.length > 0 ? "bi-pencil" : "bi-plus-circle"} me-1`}></i>
                                {insumosSuministrados.length > 0 ? "Modificar insumos" : "Asociar insumos"}
                            </Button>
                        )}
                    </h6>
                    {insumosSuministrados.length === 0 ? (
                        <p className="text-muted mb-0">
                            Este proveedor todavía no tiene insumos asociados del catálogo.
                        </p>
                    ) : (
                        <Table responsive bordered hover size="sm" className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Insumo</th>
                                    <th>Unidad de medida</th>
                                    <th>Estado en catálogo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {insumosSuministrados.map((registro) => (
                                    <tr key={registro.id}>
                                        <td className="fw-semibold">{registro.insumo.nombre}</td>
                                        <td>{registro.insumo.unidad_medida?.nombre || "U"}</td>
                                        <td>
                                            <span className={`badge ${registro.insumo.activo ? "bg-success" : "bg-secondary"}`}>
                                                {registro.insumo.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
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
            </div>

            {mostrarModalInsumos && (
                <AsociarInsumosProveedorModal
                    proveedor={proveedor}
                    onHide={() => setMostrarModalInsumos(false)}
                    onAsociado={() => {
                        mutate(`/proveedores/${id}`);
                        mutate("/proveedores/");
                    }}
                />
            )}
        </Container>
    );
}
