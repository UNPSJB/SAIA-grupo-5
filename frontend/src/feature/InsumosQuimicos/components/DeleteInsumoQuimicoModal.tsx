import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { InsumoQuimico } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteInsumoQuimicoModalProps {
    insumoQuimico: InsumoQuimico | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteInsumoQuimicoModal({ insumoQuimico, onHide, onDeleted }: DeleteInsumoQuimicoModalProps) {
    const handleCambiarEstado = async () => {
        if (!insumoQuimico) return;

        const estabaActivo = insumoQuimico.activo;

        try {
            await api.patch<InsumoQuimico>(`/insumos-quimicos/${insumoQuimico.id}/estado`);
            mostrarAlertaExito(`El insumo químico '${insumoQuimico.nombre}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
            onDeleted();
            onHide();
        } catch (error: any){
            mostrarAlertaError(`No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} el insumo químico '${insumoQuimico.nombre}'.`);
            console.log(error);
        }
    };

    const estaActivo = insumoQuimico?.activo ?? true;

    return (
        <Modal show={insumoQuimico !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} insumo químico</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? 'dar de baja' : 'dar de alta'} el insumo químico <strong>{insumoQuimico?.nombre}</strong>?
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
