import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { Proveedor } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteProveedorModalProps {
    proveedor: Proveedor | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteProveedorModal({ proveedor, onHide, onDeleted }: DeleteProveedorModalProps) {
    const handleCambiarEstado = async () => {
        if (!proveedor) return;

        const estabaActivo = proveedor.activo;

        try {
            await api.patch<Proveedor>(`/proveedores/${proveedor.id}/estado`);
            mostrarAlertaExito(`El proveedor '${proveedor.nombre}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
            onDeleted();
        } catch (error: any) {
            let mensajeFinal = `No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} el proveedor '${proveedor.nombre}'.`;
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

    const estaActivo = proveedor?.activo ?? true;

    return (
        <Modal show={proveedor !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} proveedor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? 'dar de baja' : 'dar de alta'} al proveedor <strong>{proveedor?.nombre}</strong>?
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