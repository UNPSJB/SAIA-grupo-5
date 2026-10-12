import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { TipoIncidente } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteTipoIncidenteModalProps {
    tipoIncidente: TipoIncidente | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteTipoIncidenteModal({ tipoIncidente, onHide, onDeleted }: DeleteTipoIncidenteModalProps) {
    const handleCambiarEstado = async () => {
        if (!tipoIncidente) return;

        const estabaActivo = tipoIncidente.activo;

        try {
            await api.patch<TipoIncidente>(`/tipos-incidentes/${tipoIncidente.id}/estado`);
            mostrarAlertaExito(`El tipo incidente '${tipoIncidente.nombre}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
            onDeleted();
        } catch (error: any){
            let mensajeFinal = "No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} el tipo incidente '${tipoIncidente.nombre}'."
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

    const estaActivo = tipoIncidente?.activo ?? true;

    return (
        <Modal show={tipoIncidente !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} tipo incidente</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? 'dar de baja' : 'dar de alta'} el tipo incidente <strong>{tipoIncidente?.nombre}</strong>?
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
