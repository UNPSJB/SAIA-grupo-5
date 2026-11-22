import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { Alergeno } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteAlergenoModalProps {
    alergeno: Alergeno | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteAlergenoModal({ alergeno, onHide, onDeleted }: DeleteAlergenoModalProps) {
    const handleCambiarEstado = async () => {
        if (!alergeno) return;

        const estabaActivo = alergeno.activo;

        try {
            await api.patch<Alergeno>(`/alergenos/${alergeno.id}/estado`);
            mostrarAlertaExito(`El alérgeno '${alergeno.nombre}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
            onDeleted();
        } catch (error: any) {
            let mensajeFinal = `No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} el alérgeno '${alergeno.nombre}'.`;
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

    const estaActivo = alergeno?.activo ?? true;

    return (
        <Modal show={alergeno !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} alérgeno</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estas seguro que queres {estaActivo ? 'dar de baja' : 'dar de alta'} el alérgeno <strong>{alergeno?.nombre}</strong>?
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