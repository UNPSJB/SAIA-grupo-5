import { Container, Alert, Row, Col, Card, Button, Tab } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { Producto } from "../types";
import { PageLoading } from "../../../components/PageLoading";
import { useAuth } from "../../../hooks";
import { ResumenRecetaProducto } from "../../Recetas/components/ResumenRecetaProducto";
import { CodigoBarras } from "../components/CodigoBarras";
import { AppTabs } from "../../../components/AppTabs";
import { Dato } from "../../../components/Dato";
import { EstadoBadge } from "../../../components/EstadoBadge";

export function VerProductoPage() {
    const navigate = useNavigate();
    const locacion = useLocation();
    const { id } = useParams();
    const { currentUser } = useAuth();

    const { data: producto, isLoading, error } = useApi<Producto>(`/productos/${id}`);

    const tituloPagina = "Detalle del Producto";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!producto || error) return (
        <Container>
            <PageHeader title="Producto no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrió un error al cargar los datos." : "El Producto ingresado no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <Container>
            <PageHeader title={tituloPagina} />

            <AppTabs defaultActiveKey="general" id="secciones-producto" className="mb-3 mt-3" mountOnEnter>
                <Tab eventKey="general" title="Información general">
                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                        <Card.Body className="p-4">
                            <h6 className="detalle-seccion-titulo">Datos del producto</h6>
                            <Row className="g-3 mb-4">
                                <Dato etiqueta="Producto" md={6} lg={4}>
                                    <span className="fw-semibold">{producto.nombre}</span>
                                </Dato>
                                <Dato etiqueta="Código del producto" md={6} lg={4}>
                                    {producto.codigo_producto || <span className="text-muted fst-italic">Sin código asignado</span>}
                                </Dato>
                                <Dato etiqueta="Estado Actual" md={6} lg={4}>
                                    <EstadoBadge
                                        tono={producto.activo ? "success" : "danger"}
                                        icono={producto.activo ? "bi-check-circle-fill" : "bi-x-circle-fill"}
                                    >
                                        {producto.activo ? "Vigente" : "Descontinuado"}
                                    </EstadoBadge>
                                </Dato>
                                <Dato etiqueta="Cantidad neta" md={6} lg={4}>
                                    {producto.cantidad_neta} {producto.unidad_medida.nombre}
                                </Dato>
                                <Dato etiqueta="Unidad de medida" md={6} lg={4}>{producto.unidad_medida.nombre}</Dato>
                                <Dato etiqueta="Fecha de lanzamiento" md={6} lg={4}>
                                    {producto.fecha_lanzamiento.split("-").reverse().join("/")}
                                </Dato>
                                <Dato etiqueta="Descripción">
                                    {producto.descripcion || <span className="text-muted fst-italic">Sin descripción detallada</span>}
                                </Dato>
                            </Row>

                            <h6 className="detalle-seccion-titulo">Identificación</h6>
                            <Row className="g-3">
                                <Dato etiqueta="Código de barras" md={6}>
                                    {producto.codigo_barras ? (
                                        <div>
                                            <CodigoBarras codigo={producto.codigo_barras} />
                                            <p className="text-muted small mb-0">Código EAN-13 demostrativo</p>
                                        </div>
                                    ) : (
                                        <span className="text-muted fst-italic">Sin código de barras asignado</span>
                                    )}
                                </Dato>
                                <Dato etiqueta="Foto del producto" md={6}>
                                    {producto.foto_producto ? (
                                        <img
                                            src={producto.foto_producto}
                                            alt={producto.nombre}
                                            style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', objectFit: 'cover' }}
                                            className="border shadow-sm"
                                        />
                                    ) : (
                                        <span className="text-muted fst-italic">Sin foto</span>
                                    )}
                                </Dato>
                            </Row>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="receta" title="Receta">
                    <div className="mb-4">
                        <ResumenRecetaProducto
                            productoId={producto.id}
                            tieneReceta={producto.receta != null}
                        />
                    </div>
                </Tab>
            </AppTabs>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
                <Button
                    variant="outline-secondary"
                    onClick={() => navigate(`/productos`)}
                >
                    <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                </Button>
                {currentUser?.administrar && (
                    <Button
                        variant="primary"
                        disabled={!producto.activo}
                        onClick={() => navigate(`/productos/${producto.id}/edit`, { state: locacion.state })}
                    >
                        <i className="bi bi-pencil me-1"></i>Editar Producto
                    </Button>
                )}
            </div>
        </Container>
    );
}
