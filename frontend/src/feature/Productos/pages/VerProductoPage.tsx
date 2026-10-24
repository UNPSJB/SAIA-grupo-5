import { Container, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { Producto } from "../types";
import { PageLoading } from "../../../components/PageLoading";
import { useAuth } from "../../../hooks";

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

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">

                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Producto</Col>
                                <Col sm={8} className="fs-6">
                                    {producto.nombre} 
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Descripcion</Col>
                                <Col sm={8}>
                                    {producto.descripcion ? (
                                        <span>{producto.descripcion}</span>
                                    ) : (
                                        <span className="text-muted fst-italic">Sin descripcion detallada</span>
                                    )}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Unidad de medida</Col>
                                <Col sm={8}>{producto.unidad_medida.nombre}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Cantidad neta</Col>
                                <Col sm={8}>{producto.cantidad_neta}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Fecha de lanzamiento</Col>
                                <Col sm={8}>{producto.fecha_lanzamiento.split("-").reverse().join("/")}</Col>
                            </Row>

                            {/* Para el archivo adjunto preguntamos si existe, si no tiene nada cargado se muestra un texto, sino se comprueba si es una foto para mostrarla y si no lo es se deja descargar el archivo */}
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Foto del producto</Col>
                                <Col sm={8}>
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
                                </Col>
                            </Row>

                            <Row className="mb-2 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Estado Actual</Col>
                                <Col sm={8}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: producto.activo ? '#dcfce7' : '#fee2e2',
                                            color: producto.activo ? '#166534' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${producto.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                        {producto.activo ? 'Vigente' : 'Descontinuado'}
                                    </div>
                                </Col>
                            </Row>

                            
                            
                            
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-start gap-2">
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
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}