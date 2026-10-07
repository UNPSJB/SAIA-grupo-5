import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { TipoVencimiento } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteTipoVencimientoModalProps {
    tipoVencimiento: TipoVencimiento | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteTipoVencimientoModal({ tipoVencimiento, onHide, onDeleted }: DeleteTipoVencimientoModalProps) {
    const handleCambiarEstado = async () => {
        if (!tipoVencimiento) return;

        const estabaActivo = tipoVencimiento.activo;

        try {
            await api.patch<TipoVencimiento>(`/tipos-vencimientos/${tipoVencimiento.id}/estado`);
            mostrarAlertaExito(`El tipo vencimiento '${tipoVencimiento.nombre}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
            onDeleted();
        } catch (error: any){
            let mensajeFinal = `No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} el tipo vencimiento '${tipoVencimiento.nombre}'.`
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

    const estaActivo = tipoVencimiento?.activo ?? true;

    return (
        <Modal show={tipoVencimiento !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} tipo vencimiento</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? 'dar de baja' : 'dar de alta'} el tipo vencimiento <strong>{tipoVencimiento?.nombre}</strong>?
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
