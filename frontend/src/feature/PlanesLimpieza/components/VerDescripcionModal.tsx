import { Modal } from "react-bootstrap";
import type { PlanLimpieza } from "../types";

interface VerDescripcionModalProps {
    plan: PlanLimpieza | null;
    onHide: () => void;
}

export function VerDescripcionModal({ plan, onHide }: VerDescripcionModalProps) {
    return (
        <Modal
            show={plan !== null}
            onHide={onHide}
            size="lg"
            aria-labelledby="example-custom-modal-styling-title"
        >
            <Modal.Header closeButton>
                <Modal.Title>Descripción de {plan?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-0">
                    {plan?.descripcion || "Sin descripción."}
                </p>
            </Modal.Body>
        </Modal>
    );
}
