import { ListGroup, Modal } from "react-bootstrap";
import type { PlanLimpieza } from "../types";

interface VerEquiposModalProps {
    plan: PlanLimpieza | null;
    onHide: () => void;
}

export function VerEquiposModal({ plan, onHide }: VerEquiposModalProps) {
    return (
        <Modal 
            show={plan !== null} 
            onHide={onHide}
            size="lg"
            aria-labelledby="example-custom-modal-styling-title"
        >
            <Modal.Header closeButton>
                <Modal.Title>Equipos de {plan?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {plan && plan.equipos.length > 0 ? (
                    <ListGroup variant="flush">
                        {plan.equipos.map((equipo) => (
                            <ListGroup.Item key={equipo.id}>{equipo.nombre}</ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <p className="text-muted mb-0">
                        Este plan de limpieza no tiene equipos vinculados todavía.
                    </p>
                )}
            </Modal.Body>
        </Modal>
    );
}
