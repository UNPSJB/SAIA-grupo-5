import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import { getErrorMessage } from "../../../libs/errors";
import type { PlanLimpieza } from "../types";

interface DeletePlanLimpiezaModalProps {
    plan: PlanLimpieza | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeletePlanLimpiezaModal({ plan, onHide, onDeleted }: DeletePlanLimpiezaModalProps) {
    const handleDelete = async () => {
        if (!plan) return;
        try {
            await api.delete(`/planes-limpieza/${plan.id}`);
            onDeleted();
            onHide();
        } catch (error: any) {
            alert(getErrorMessage(error, "No se pudo eliminar el plan de limpieza."));
            console.log(error);
        }
    };

    return (
        <Modal show={plan !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Eliminar plan de limpieza</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés eliminar el plan de limpieza <strong>{plan?.nombre}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
            </Modal.Footer>
        </Modal>
    );
}
