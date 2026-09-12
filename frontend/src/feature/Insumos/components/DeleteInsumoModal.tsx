import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { Insumo } from "../types";

interface DeleteInsumoModalProps {
    insumo: Insumo | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteInsumoModal({ insumo, onHide, onDeleted }: DeleteInsumoModalProps) {
    const handleDelete = async () => {
        if (!insumo) return;
        await api.delete(`/insumos/${insumo.id}`);
        onDeleted();
        onHide();
    };

    return (
        <Modal show={insumo !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Eliminar insumo</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés eliminar el insumo <strong>{insumo?.nombre}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
            </Modal.Footer>
        </Modal>
    );
}
