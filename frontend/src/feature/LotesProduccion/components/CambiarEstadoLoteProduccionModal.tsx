import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { LoteProduccion, EstadoLote } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface CambiarEstadoLoteModalProps {
    lote: LoteProduccion | null;
    onHide: () => void;
    onChanged: () => void;
}

const SIGUIENTE_ESTADO_TEXTO: Record<EstadoLote, string> = {
    "En produccion": "Empaquetando",
    "Empaquetando": "Terminado",
    "Terminado": "Enviado",
    "Enviado": "Enviado",
};

export function CambiarEstadoLoteModal({ lote, onHide, onChanged }: CambiarEstadoLoteModalProps) {
    if (!lote) return null;

    const nuevoEstado = SIGUIENTE_ESTADO_TEXTO[lote.estado];

    const handleCambiarEstado = async () => {
        try {
            await api.patch(`/lotes-produccion/${lote.id}/estado`);
            mostrarAlertaExito(`El lote de produccion numero ${lote.id} paso al estado '${nuevoEstado}'.`);
            onChanged();
        } catch (error: any) {
            let mensajeFinal = "No se pudo cambiar el estado del lote de produccion numero ${lote.id}.";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
        } finally {
            onHide();
        }
    };

    return (
        <Modal show={lote !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Avanzar estado del lote de produccion numero {lote.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Desea cambiar el estado del lote de produccion numero <strong>{lote.id}</strong> de <strong>{lote.estado}</strong> a <strong>{nuevoEstado}</strong>?
            </Modal.Body>
            <Modal.Footer className="justify-content-start">
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="primary" onClick={handleCambiarEstado}>
                    Pasar a {nuevoEstado}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}