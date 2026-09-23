import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { TipoQuimico } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteTipoQuimicoModalProps {
    tipoQuimico: TipoQuimico | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteTipoQuimicoModal({ tipoQuimico, onHide, onDeleted }: DeleteTipoQuimicoModalProps) {
    const handleCambiarEstado = async () => {
        if (!tipoQuimico) return;

        const estabaActivo = tipoQuimico.activo;

        try {
            await api.patch<TipoQuimico>(`/tipos-quimicos/${tipoQuimico.id}/estado`);
            mostrarAlertaExito(`El tipo químico '${tipoQuimico.nombre}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
            onDeleted();
            onHide();
        } catch (error: any){
            mostrarAlertaError(`No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} el tipo químico '${tipoQuimico.nombre}'.`);
            console.log(error);
        }
    };

    const estaActivo = tipoQuimico?.activo ?? true;

    return (
        <Modal show={tipoQuimico !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} tipo químico</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? 'dar de baja' : 'dar de alta'} el tipo químico <strong>{tipoQuimico?.nombre}</strong>?
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
