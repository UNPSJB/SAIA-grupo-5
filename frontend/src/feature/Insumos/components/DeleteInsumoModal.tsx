import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { Insumo } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteInsumoModalProps {
    insumo: Insumo | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteInsumoModal({ insumo, onHide, onDeleted }: DeleteInsumoModalProps) {
    const handleCambiarEstado = async () => {
        if (!insumo) return;

        const estabaActivo = insumo.activo;

        try {
            await api.patch<Insumo>(`/insumos/${insumo.id}/estado`);
            mostrarAlertaExito(`El insumo '${insumo.nombre}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
            onDeleted();
        } catch (error: any){
            let mensajeFinal = `No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} el insumo '${insumo.nombre}'.`;
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

    const estaActivo = insumo?.activo ?? true;

    return (
        <Modal show={insumo !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} insumo</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? 'dar de baja' : 'dar de alta'} el insumo <strong>{insumo?.nombre}</strong>?
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
