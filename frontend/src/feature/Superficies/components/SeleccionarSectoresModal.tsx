import { Button, ListGroup, Modal } from "react-bootstrap";
import type { Sector } from "../../Sectores/types";
import { AppSwitch } from "../../../components/AppSwitch";

interface SeleccionarSectoresModalProps {
    show: boolean;
    sectores: Sector[];
    selectedIds: string[];
    onToggle: (id: string, checked: boolean) => void;
    onHide: () => void;
}

export function SeleccionarSectoresModal({ show, sectores, selectedIds, onToggle, onHide }: SeleccionarSectoresModalProps) {
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Seleccionar sectores</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {sectores.length > 0 ? (
                    <ListGroup variant="flush">
                        {sectores.map((sector) => (
                            <ListGroup.Item key={sector.id}>
                                <AppSwitch
                                    id={`sector-switch-${sector.id}`}
                                    label={sector.nombre}
                                    checked={selectedIds.includes(String(sector.id))}
                                    onChange={(e) => onToggle(String(sector.id), e.target.checked)}
                                />
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <p className="text-muted mb-0">No hay sectores para seleccionar.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onHide}>Confirmar</Button>
            </Modal.Footer>
        </Modal>
    );
}
