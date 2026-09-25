import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { ElementoLimpieza } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteElementoLimpiezaModalProps {
    elementoLimpieza: ElementoLimpieza | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteElementoLimpiezaModal({ elementoLimpieza, onHide, onDeleted }: DeleteElementoLimpiezaModalProps) {
    const handleDarBaja = async () => {
        if (!elementoLimpieza) return;

        try {
            await api.delete<ElementoLimpieza>(`/elementos-limpieza/${elementoLimpieza.id}`);
            mostrarAlertaExito(`El elemento de limpieza '${elementoLimpieza.nombre}' se dio de baja correctamente.`);
            onDeleted();
        } catch (error: any){
            const mensajeBackend = error.response?.data?.detail;
            const mensajeFinal = mensajeBackend || `No se pudo dar de baja el elemento de limpieza '${elementoLimpieza.nombre}'.`;
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        } finally{
            onHide();
        }
    };

    return (
        <Modal show={elementoLimpieza !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Dar de baja elemento de limpieza</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés dar de baja el elemento de limpieza <strong>{elementoLimpieza?.nombre}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="danger" onClick={handleDarBaja}>
                    Dar de baja
                </Button>
            </Modal.Footer>
        </Modal>
    );
}