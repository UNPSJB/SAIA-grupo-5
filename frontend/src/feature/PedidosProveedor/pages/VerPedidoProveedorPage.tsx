import { Alert, Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";
import type { PedidoProveedor } from "../types";

export function VerPedidoProveedorPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentUser } = useAuth();

    const { data: pedido, isLoading, error } = useApi<PedidoProveedor>(`/pedidos-proveedor/${id}`);

    const tituloPagina = `Detalle del Pedido #${id}`;

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!pedido || error) {
        return (
            <Container>
                <PageHeader title="Pedido no encontrado." />
                <Row className="justify-content-center mt-4">
                    <Col md={6}>
                        <Alert variant="danger" className="text-center shadow-sm">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error ? "Ocurrió un error al cargar los datos." : "El pedido ingresado no existe."}
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    const esRecibido = pedido.estado === "recibido";
    const bg = !pedido.activo ? "#fee2e2" : esRecibido ? "#dcfce7" : "#fef3c7";
    const color = !pedido.activo ? "#991b1b" : esRecibido ? "#166534" : "#92400e";
    const textoEstado = !pedido.activo ? "Anulado" : esRecibido ? "Recibido" : "Pendiente";
    const editable = pedido.activo && pedido.estado === "pendiente";

    return (
        <Container>
            <PageHeader title={tituloPagina} />

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Proveedor</Col>
                                <Col sm={8} className="fs-6 fw-semibold">
                                    {pedido.proveedor?.nombre} ({pedido.proveedor?.cuit})
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Fecha de Pedido</Col>
                                <Col sm={8}>{pedido.fecha_pedido.split("-").reverse().join("/")}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Entrega Estimada</Col>
                                <Col sm={8}>
                                    {pedido.fecha_entrega_estimada ? (
                                        pedido.fecha_entrega_estimada.split("-").reverse().join("/")
                                    ) : (
                                        <span className="text-muted fst-italic">Sin fecha estimada</span>
                                    )}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Registrado por</Col>
                                <Col sm={8}>
                                    {pedido.registrado_por
                                        ? `${pedido.registrado_por.nombre} ${pedido.registrado_por.apellido}`
                                        : "-"}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Estado</Col>
                                <Col sm={8}>
                                    <div
                                        style={{
                                            padding: "6px 16px",
                                            borderRadius: "20px",
                                            background: bg,
                                            color: color,
                                            fontWeight: 700,
                                            display: "inline-flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        {textoEstado}
                                    </div>
                                </Col>
                            </Row>

                            {pedido.observacion && (
                                <Row className="mb-3 border-bottom pb-3 align-items-start">
                                    <Col sm={4} className="fw-bold text-secondary">Observaciones</Col>
                                    <Col sm={8} className="text-muted">{pedido.observacion}</Col>
                                </Row>
                            )}

                            <h5 className="mt-4 mb-3">
                                <i className="bi bi-box-seam me-2"></i>Insumos Solicitados
                            </h5>

                            <Table responsive bordered hover size="sm" className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Insumo</th>
                                        <th>Cantidad Pedida</th>
                                        <th>Unidad de Medida</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedido.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="fw-semibold">{item.insumo?.nombre}</td>
                                            <td>{item.cantidad_pedida}</td>
                                            <td>{item.insumo?.unidad_medida?.nombre || "U"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-start gap-2">
                            <Button variant="outline-secondary" onClick={() => navigate("/pedidos-proveedor")}>
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>

                            {currentUser?.administrar && (
                                <Button
                                    variant="primary"
                                    disabled={!editable}
                                    onClick={() => navigate(`/pedidos-proveedor/${pedido.id}/edit`)}
                                >
                                    <i className="bi bi-pencil me-1"></i>Editar Pedido
                                </Button>
                            )}
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}