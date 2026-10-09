import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { Incidente } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteIncidenteModalProps {
    incidente: Incidente | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteIncidenteModal({ incidente, onHide, onDeleted }: DeleteIncidenteModalProps) {
    const handleCambiarEstado = async () => {
        if (!incidente) return;

        const estabaActivo = incidente.activo;

        try {
            await api.patch<Incidente>(`/incidentes/${incidente.id}/estado`);
            mostrarAlertaExito(`El incidente '${incidente.nombre}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
            onDeleted();
        } catch (error: any){
            let mensajeFinal = "No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} el incidente '${incidente.nombre}'."
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

    const estaActivo = incidente?.activo ?? true;

    return (
        <Modal show={incidente !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} incidente</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? 'dar de baja' : 'dar de alta'} el incidente <strong>{incidente?.nombre}</strong>?
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
