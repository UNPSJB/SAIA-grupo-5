import { Alert, Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { Dato } from "../../../components/Dato";
import { EstadoBadge, type TonoEstado } from "../../../components/EstadoBadge";
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
    const tonoEstado: TonoEstado = !pedido.activo ? "danger" : esRecibido ? "success" : "warning";
    const textoEstado = !pedido.activo ? "Anulado" : esRecibido ? "Recibido" : "Pendiente";
    const editable = pedido.activo && pedido.estado === "pendiente";

    return (
        <Container>
            <PageHeader title={tituloPagina} />

            <Card className="shadow-sm border-0 rounded-3 mb-4 mt-3 text-start">
                <Card.Body className="p-4">
                    <h6 className="detalle-seccion-titulo">Información del pedido</h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta="Proveedor" md={6} lg={4}>
                            <span className="fw-semibold">{pedido.proveedor?.nombre}</span>
                            {pedido.proveedor?.cuit && <div className="text-muted small">CUIT: {pedido.proveedor.cuit}</div>}
                        </Dato>
                        <Dato etiqueta="Fecha de Pedido" md={6} lg={4}>
                            {pedido.fecha_pedido.split("-").reverse().join("/")}
                        </Dato>
                        <Dato etiqueta="Entrega Estimada" md={6} lg={4}>
                            {pedido.fecha_entrega_estimada
                                ? pedido.fecha_entrega_estimada.split("-").reverse().join("/")
                                : <span className="text-muted fst-italic">Sin fecha estimada</span>}
                        </Dato>
                        <Dato etiqueta="Estado" md={6} lg={4}>
                            <EstadoBadge tono={tonoEstado}>{textoEstado}</EstadoBadge>
                        </Dato>
                        <Dato etiqueta="Registrado por" md={6} lg={4}>
                            {pedido.registrado_por
                                ? `${pedido.registrado_por.nombre} ${pedido.registrado_por.apellido}`
                                : "-"}
                        </Dato>
                        <Dato etiqueta="Cantidad de insumos" md={6} lg={4}>
                            {pedido.items.length}
                        </Dato>
                        {pedido.observacion && (
                            <Dato etiqueta="Observaciones">
                                <span className="text-muted">{pedido.observacion}</span>
                            </Dato>
                        )}
                    </Row>

                    <h6 className="detalle-seccion-titulo">Insumos Solicitados</h6>
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
            </Card>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
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
            </div>
        </Container>
    );
}
