import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { PedidoProveedorForm } from "../components/PedidoProveedorForm";
import { api } from "../../../libs/axios";
import type { NewPedidoProveedor } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevoPedidoProveedorPage() {
    const navigate = useNavigate();

    const guardarPedido = async (datos: NewPedidoProveedor) => {
        try {
            await api.post("/pedidos-proveedor/", datos);
            await mutate("/pedidos-proveedor/");
            mostrarAlertaExito("El pedido al proveedor se registro correctamente.");
            navigate("/pedidos-proveedor");
        } catch (error: any) {
            let mensajeFinal = "No se pudo registrar el pedido.";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    return (
        <>
            <PageHeader title="Nuevo Pedido a Proveedor" />
            <Container>
                <PedidoProveedorForm textoBoton="Registrar Pedido" onSubmit={guardarPedido} />
            </Container>
        </>
    );
}