import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import { getErrorMessage } from "../../../libs/errors";
import type { Tarea } from "../types";

interface DeleteTareaModalProps {
    tarea: Tarea | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteTareaModal({ tarea, onHide, onDeleted }: DeleteTareaModalProps) {
    const handleDelete = async () => {
        if (!tarea) return;
        try {
            await api.delete(`/tareas/${tarea.id}`);
            onDeleted();
            onHide();
        } catch (error) {
            alert(getErrorMessage(error, "No se pudo eliminar la tarea."));
        }
    };

    return (
        <Modal show={tarea !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Eliminar tarea</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés eliminar la tarea <strong>{tarea?.nombre}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
            </Modal.Footer>
        </Modal>
    );
}
