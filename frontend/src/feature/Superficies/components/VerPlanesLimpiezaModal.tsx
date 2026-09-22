import { ListGroup, Modal } from "react-bootstrap";
import type { Superficie } from "../types";

interface VerPlanesLimpiezaModalProps {
    superficie: Superficie | null;
    onHide: () => void;
}

export function VerPlanesLimpiezaModal({ superficie, onHide }: VerPlanesLimpiezaModalProps) {
    return (
        <Modal
            show={superficie !== null}
            onHide={onHide}
            size="lg"
            aria-labelledby="example-custom-modal-styling-title"
        >
            <Modal.Header closeButton>
                <Modal.Title>Planes de limpieza de {superficie?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {superficie && superficie.planes.length > 0 ? (
                    <ListGroup variant="flush">
                        {superficie.planes.map((plan) => (
                            <ListGroup.Item key={plan.id}>{plan.nombre}</ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <p className="text-muted mb-0">
                        Esta superficie no tiene planes de limpieza asociados todavía.
                    </p>
                )}
            </Modal.Body>
        </Modal>
    );
}
