import { Alert, Col, Container, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { PedidoProveedorForm } from "../components/PedidoProveedorForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { NewPedidoProveedor, PedidoProveedor } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function EditarPedidoProveedorPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: pedido, isLoading, error } = useApi<PedidoProveedor>(`/pedidos-proveedor/${id}`);

    const actualizarPedido = async (datos: NewPedidoProveedor) => {
        try {
            await api.put(`/pedidos-proveedor/${id}`, {
                fecha_entrega_estimada: datos.fecha_entrega_estimada,
                observacion: datos.observacion,
                items: datos.items,
            });
            await mutate("/pedidos-proveedor/");
            await mutate(`/pedidos-proveedor/${id}`);
            mostrarAlertaExito("El pedido se edito correctamente.");
            navigate("/pedidos-proveedor");
        } catch (error: any) {
            let mensajeFinal = "No se pudo editar el pedido.";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    const tituloPagina = "Editar Pedido a Proveedor";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!pedido || error) {
        return (
            <Container>
                <PageHeader title="Pedido no encontrado" />
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Alert variant="danger">El pedido ingresado no existe.</Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (!pedido.activo || pedido.estado !== "pendiente") {
        return (
            <Container>
                <PageHeader title={tituloPagina} />
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Alert variant="warning">
                            Solo se pueden editar pedidos activos en estado pendiente.
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <>
            <PageHeader title={tituloPagina} />
            <Container>
                <PedidoProveedorForm
                    textoBoton="Guardar Cambios"
                    onSubmit={actualizarPedido}
                    proveedorFijo={pedido.proveedor}
                    valoresIniciales={{
                        proveedor_id: pedido.proveedor_id,
                        fecha_entrega_estimada: pedido.fecha_entrega_estimada,
                        observacion: pedido.observacion,
                        items: pedido.items.map((item) => ({
                            insumo_id: item.insumo_id,
                            cantidad_pedida: item.cantidad_pedida,
                        })),
                    }}
                />
            </Container>
        </>
    );
}