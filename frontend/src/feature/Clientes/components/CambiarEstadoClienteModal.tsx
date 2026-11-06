import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { Cliente } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface CambiarEstadoClienteModalProps {
    cliente: Cliente | null;
    onHide: () => void;
    onChanged: () => void;
}

export function CambiarEstadoClienteModal({ cliente, onHide, onChanged }: CambiarEstadoClienteModalProps) {
    if (!cliente) return null;


    const handleCambiarEstado = async () => {
        try {
            await api.patch(`/clientes/${cliente.id}/estado`);
            mostrarAlertaExito(`El cliente con razon social ${cliente.razon_social} se dio de baja correctamente.`);
            onChanged();
        } catch (error: any) {
            let mensajeFinal = `No se pudo cambiar el estado del cliente con razon social ${cliente.razon_social}.`;
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
        } finally {
            onHide();
        }
    };

    const estaActivo = cliente?.activo ?? true;

    return (
        <Modal show={cliente !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} producto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? 'dar de baja' : 'dar de alta'} al cliente con razon social <strong>{cliente?.razon_social}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant={estaActivo ? "danger" : "success"} onClick={handleCambiarEstado}>
                    {estaActivo ? 'Dar de baja' : 'Dar de alta'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}