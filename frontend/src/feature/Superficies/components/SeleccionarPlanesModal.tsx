import { Button, Form, ListGroup, Modal } from "react-bootstrap";
import type { PlanLimpieza } from "../../PlanesLimpieza/types";

interface SeleccionarPlanesModalProps {
    show: boolean;
    planesLimpieza: PlanLimpieza[];
    selectedIds: string[];
    onToggle: (id: string, checked: boolean) => void;
    onHide: () => void;
}

export function SeleccionarPlanesModal({ show, planesLimpieza, selectedIds, onToggle, onHide }: SeleccionarPlanesModalProps) {
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Seleccionar planes de limpieza</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {planesLimpieza.length > 0 ? (
                    <ListGroup variant="flush">
                        {planesLimpieza.map((plan) => (
                            <ListGroup.Item key={plan.id}>
                                <Form.Check
                                    type="switch"
                                    id={`plan-switch-${plan.id}`}
                                    label={plan.nombre}
                                    checked={selectedIds.includes(String(plan.id))}
                                    onChange={(e) => onToggle(String(plan.id), e.target.checked)}
                                />
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <p className="text-muted mb-0">No hay planes de limpieza para seleccionar.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onHide}>Confirmar</Button>
            </Modal.Footer>
        </Modal>
    );
}
