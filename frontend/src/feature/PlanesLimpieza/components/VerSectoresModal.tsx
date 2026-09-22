import { ListGroup, Modal } from "react-bootstrap";
import type { PlanLimpieza } from "../types";

interface VerSectoresModalProps {
    plan: PlanLimpieza | null;
    onHide: () => void;
}

export function VerSectoresModal({ plan, onHide }: VerSectoresModalProps) {
    return (
        <Modal 
            show={plan !== null} 
            onHide={onHide}
            size="lg"
            aria-labelledby="example-custom-modal-styling-title"
        >
            <Modal.Header closeButton>
                <Modal.Title>Sectores de {plan?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {plan && plan.sectores.length > 0 ? (
                    <ListGroup variant="flush">
                        {plan.sectores.map((sector) => (
                            <ListGroup.Item key={sector.id}>{sector.nombre}</ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <p className="text-muted mb-0">
                        Este plan de limpieza no tiene sectores vinculados todavía.
                    </p>
                )}
            </Modal.Body>
        </Modal>
    );
}
