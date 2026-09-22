import { ListGroup, Modal } from "react-bootstrap";
import type { PlanLimpieza } from "../types";

interface VerSuperficiesModalProps {
    plan: PlanLimpieza | null;
    onHide: () => void;
}

export function VerSuperficiesModal({ plan, onHide }: VerSuperficiesModalProps) {
    return (
        <Modal 
            show={plan !== null} 
            onHide={onHide}
            size="lg"
            aria-labelledby="example-custom-modal-styling-title"
        >
            <Modal.Header closeButton>
                <Modal.Title>Superficies de {plan?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {plan && plan.superficies.length > 0 ? (
                    <ListGroup variant="flush">
                        {plan.superficies.map((superficie) => (
                            <ListGroup.Item key={superficie.id}>{superficie.nombre}</ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <p className="text-muted mb-0">
                        Este plan de limpieza no tiene superficies vinculadas todavía.
                    </p>
                )}
            </Modal.Body>
        </Modal>
    );
}
