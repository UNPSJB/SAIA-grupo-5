import { Button, Form, ListGroup, Modal } from "react-bootstrap";
import type { Superficie } from "../../Superficies/types";

interface SeleccionarSuperficiesModalProps {
    show: boolean;
    superficies: Superficie[];
    selectedIds: string[];
    onToggle: (id: string, checked: boolean) => void;
    onHide: () => void;
}

export function SeleccionarSuperficiesModal({ show, superficies, selectedIds, onToggle, onHide }: SeleccionarSuperficiesModalProps) {
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Seleccionar superficies</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {superficies.length > 0 ? (
                    <ListGroup variant="flush">
                        {superficies.map((superficie) => (
                            <ListGroup.Item key={superficie.id}>
                                <Form.Check
                                    type="switch"
                                    id={`plan-superficie-switch-${superficie.id}`}
                                    label={superficie.nombre}
                                    checked={selectedIds.includes(String(superficie.id))}
                                    onChange={(e) => onToggle(String(superficie.id), e.target.checked)}
                                />
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <p className="text-muted mb-0">No hay superficies para seleccionar.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onHide}>Confirmar</Button>
            </Modal.Footer>
        </Modal>
    );
}
