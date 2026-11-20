import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { FuenteNutricional } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteFuenteNutricionalModalProps {
    fuente: FuenteNutricional | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteFuenteNutricionalModal({ fuente, onHide, onDeleted }: DeleteFuenteNutricionalModalProps) {
    const handleCambiarEstado = async () => {
        if (!fuente) return;

        const estabaActivo = fuente.activo;

        try {
            await api.patch<FuenteNutricional>(`/fuentes-nutricionales/${fuente.id}/estado`);
            mostrarAlertaExito(`La fuente nutricional '${fuente.nombre}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
            onDeleted();
        } catch (error: any) {
            let mensajeFinal = `No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} la fuente nutricional '${fuente.nombre}'.`;
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

    const estaActivo = fuente?.activo ?? true;

    return (
        <Modal show={fuente !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} fuente nutricional</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estas seguro que queres {estaActivo ? 'dar de baja' : 'dar de alta'} la fuente nutricional <strong>{fuente?.nombre}</strong>?
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