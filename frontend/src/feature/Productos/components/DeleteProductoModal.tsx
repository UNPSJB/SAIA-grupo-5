import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { Producto } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteProductoModalProps {
    producto: Producto | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteProductoModal({ producto, onHide, onDeleted }: DeleteProductoModalProps) {
    const handleCambiarEstado = async () => {
        if (!producto) return;

        const estabaActivo = producto.activo;

        try {
            await api.patch<Producto>(`/productos/${producto.id}/estado`);
            mostrarAlertaExito(`El producto '${producto.nombre}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
            onDeleted();
        } catch (error: any){
            let mensajeFinal = `No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} el producto '${producto.nombre}'.`;
            if (error.response?.data?.detail){      
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        } finally {
            onHide();
        }
    };

    const estaActivo = producto?.activo ?? true;

    return (
        <Modal show={producto !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} producto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? 'dar de baja' : 'dar de alta'} el producto <strong>{producto?.nombre}</strong>?
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
