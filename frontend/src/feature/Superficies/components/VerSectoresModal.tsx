import { ListGroup, Modal } from "react-bootstrap";
import type { Superficie } from "../types";

interface VerSectoresModalProps {
    superficie: Superficie | null;
    onHide: () => void;
}

export function VerSectoresModal({ superficie, onHide }: VerSectoresModalProps) {
    return (
        <Modal 
            show={superficie !== null} 
            onHide={onHide}
            size="lg"
            aria-labelledby="example-custom-modal-styling-title"
        >
            <Modal.Header closeButton>
                <Modal.Title>Sectores de {superficie?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {superficie && superficie.sectores.length > 0 ? (
                    <ListGroup variant="flush">
                        {superficie.sectores.map((sector) => (
                            <ListGroup.Item key={sector.id}>{sector.nombre}</ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <p className="text-muted mb-0">
                        Esta superficie no tiene sectores asociados todavía.
                    </p>
                )}
            </Modal.Body>
        </Modal>
    );
}
