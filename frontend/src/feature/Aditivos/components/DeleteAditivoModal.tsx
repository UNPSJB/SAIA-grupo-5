import { Button, Modal } from "react-bootstrap";
import { isAxiosError } from "axios";
import { api } from "../../../libs/axios";
import type { Aditivo } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteAditivoModalProps {
    aditivo: Aditivo | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteAditivoModal({ aditivo, onHide, onDeleted }: DeleteAditivoModalProps) {
    const handleCambiarEstado = async () => {
        if (!aditivo) return;

        const estabaActivo = aditivo.activo;

        try {
            await api.patch<Aditivo>(`/aditivos/${aditivo.id}/estado`);
            mostrarAlertaExito(`El aditivo '${aditivo.nombre}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
            onDeleted();
        } catch (error) {
            let mensajeFinal = `No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} el aditivo '${aditivo.nombre}'.`;
            const detail = isAxiosError(error) ? error.response?.data?.detail : undefined;
            if (detail) {
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        } finally {
            onHide();
        }
    };

    const estaActivo = aditivo?.activo ?? true;

    return (
        <Modal show={aditivo !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} aditivo</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? 'dar de baja' : 'dar de alta'} el aditivo <strong>{aditivo?.nombre}</strong>?
                {estaActivo && <div className="text-muted small mt-2">Las recetas que ya lo usan lo conservan, pero no podrá agregarse a recetas nuevas.</div>}
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
