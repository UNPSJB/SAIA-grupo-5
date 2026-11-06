import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { Superficie } from "../types";

interface DeleteSuperficieModalProps {
    superficie: Superficie | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteSuperficieModal({ superficie, onHide, onDeleted }: DeleteSuperficieModalProps) {
    const handleDelete = async () => {
        if (!superficie) return;
        await api.delete(`/superficies/${superficie.id}`);
        onDeleted();
        onHide();
    };

    return (
        <Modal show={superficie !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Eliminar superficie</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés eliminar la superficie <strong>{superficie?.nombre}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
            </Modal.Footer>
        </Modal>
    );
}
