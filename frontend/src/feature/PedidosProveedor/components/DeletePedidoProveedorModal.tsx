import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { PedidoProveedor } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeletePedidoProveedorModalProps {
    pedido: PedidoProveedor | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeletePedidoProveedorModal({ pedido, onHide, onDeleted }: DeletePedidoProveedorModalProps) {
    const handleCambiarEstado = async () => {
        if (!pedido) return;

        const estabaActivo = pedido.activo;

        try {
            await api.patch<PedidoProveedor>(`/pedidos-proveedor/${pedido.id}/estado`);
            mostrarAlertaExito(`El pedido #${pedido.id} se dio de ${estabaActivo ? "baja" : "alta"} correctamente.`);
            onDeleted();
        } catch (error: any) {
            let mensajeFinal = `No se pudo ${estabaActivo ? "dar de baja" : "dar de alta"} el pedido #${pedido.id}.`;
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        } finally {
            onHide();
        }
    };

    const estaActivo = pedido?.activo ?? true;

    return (
        <Modal show={pedido !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? "Cancelar / Dar de baja" : "Reactivar"} pedido</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? "dar de baja" : "dar de alta"} el pedido{" "}
                <strong>#{pedido?.id}</strong> al proveedor <strong>{pedido?.proveedor?.nombre}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant={estaActivo ? "danger" : "success"} onClick={handleCambiarEstado}>
                    {estaActivo ? "Dar de baja" : "Dar de alta"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}