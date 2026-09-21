import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { InsumoQuimico } from "../types";

interface DeleteInsumoQuimicoModalProps {
    insumoQuimico: InsumoQuimico | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteInsumoQuimicoModal({ insumoQuimico, onHide, onDeleted }: DeleteInsumoQuimicoModalProps) {
    const handleDelete = async () => {
        if (!insumoQuimico) return;
        await api.delete(`/insumos-quimicos/${insumoQuimico.id}`);
        onDeleted();
        onHide();
    };

    return (
        <Modal show={insumoQuimico !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Eliminar insumo quimico</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés eliminar el insumo quimico <strong>{insumoQuimico?.nombre}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
            </Modal.Footer>
        </Modal>
    );
}
