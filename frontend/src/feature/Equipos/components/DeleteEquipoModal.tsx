import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { Equipo } from "../types";

interface DeleteEquipoModalProps {
    equipo: Equipo | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteEquipoModal({ equipo, onHide, onDeleted }: DeleteEquipoModalProps) {
    const handleDelete = async () => {
        if (!equipo) return;
        await api.delete(`/equipos/${equipo.id}`);
        onDeleted();
        onHide();
    };

    return (
        <Modal show={equipo !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Eliminar equipo</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés eliminar el equipo <strong>{equipo?.nombre}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
            </Modal.Footer>
        </Modal>
    );
}
