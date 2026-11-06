import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { UnidadMedida } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteUnidadMedidaModalProps {
    unidadMedida: UnidadMedida | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteUnidadMedidaModal({ unidadMedida, onHide, onDeleted }: DeleteUnidadMedidaModalProps) {
    const handleCambiarEstado = async () => {
        if (!unidadMedida) return;

        const estabaActivo = unidadMedida.activo;

        try {
            await api.patch<UnidadMedida>(`/unidades-medida/${unidadMedida.id}/estado`);
            mostrarAlertaExito(`La unidad de medida '${unidadMedida.nombre}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
            onDeleted();
        } catch (error: any){
            let mensajeFinal = `No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} la unidad de medida '${unidadMedida.nombre}'.`
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

    const estaActivo = unidadMedida?.activo ?? true;

    return (
        <Modal show={unidadMedida !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} unidad de medida</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? 'dar de baja' : 'dar de alta'} la unidad de medida <strong>{unidadMedida?.nombre}</strong>?
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
