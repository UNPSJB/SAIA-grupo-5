import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { Sector } from "../types";

interface DeleteSectorModalProps {
    sector: Sector | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteSectorModal({ sector, onHide, onDeleted }: DeleteSectorModalProps) {
    const handleDelete = async () => {
        if (!sector) return;
        await api.delete(`/sectores/${sector.id}`);
        onDeleted();
        onHide();
    };

    return (
        <Modal show={sector !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Eliminar sector</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés eliminar el sector <strong>{sector?.nombre}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
            </Modal.Footer>
        </Modal>
    );
}
