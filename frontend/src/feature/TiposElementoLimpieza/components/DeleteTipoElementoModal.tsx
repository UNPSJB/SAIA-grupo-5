import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { TipoElementoLimpieza } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteTipoElementoLimpiezaModalProps {
    tipoElementoLimpieza: TipoElementoLimpieza | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteTipoElementoModal({ tipoElementoLimpieza, onHide, onDeleted }: DeleteTipoElementoLimpiezaModalProps) {
    const handleDarBaja = async () => {
        if (!tipoElementoLimpieza) return;

        try {
            await api.delete<TipoElementoLimpieza>(`/elementos-limpieza/tipos/${tipoElementoLimpieza.id}`);
            mostrarAlertaExito(`El tipo '${tipoElementoLimpieza.nombre}' se dio de baja correctamente.`);
            onDeleted();
        } catch (error: any){
            const mensajeBackend = error.response?.data?.detail;
            const mensajeFinal = mensajeBackend || `No se pudo dar de baja el tipo '${tipoElementoLimpieza.nombre}'.`;
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        } finally{
            onHide();
        }
    };

    return (
        <Modal show={tipoElementoLimpieza !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Dar de baja tipo de elemento</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés dar de baja el tipo <strong>{tipoElementoLimpieza?.nombre}</strong>?
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