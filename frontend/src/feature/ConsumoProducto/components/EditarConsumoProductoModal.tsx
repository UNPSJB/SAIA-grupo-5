import { Button, Modal, Form } from "react-bootstrap";
import { api } from "../../../libs/axios";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

interface EditarConsumoProductoModalProps {
    show: boolean;
    onHide: () => void;
}

export function EditarConsumoProductoModal({ show, onHide }: EditarConsumoProductoModalProps) {
    const [consumo_id, setConsumoId] = useState("");
    const [validated, setValidated] = useState(false);
    const navigate = useNavigate();
    
    const handleBuscar = () => {
        setValidated(true);

        if (!consumo_id.trim()) return;
        navigate(`/consumos_productos/${consumo_id}/edit`);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Modificar consumo registrado</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3 text-start" controlId="formConsumoId">
                    <Form.Label className="p-1 fw-bold">Consumo</Form.Label>
                    <Form.Control
                        required
                        type="number"
                        placeholder="Ingrese el ID del consumo"
                        value={consumo_id} onChange={(e) => setConsumoId(e.target.value)}
                        isInvalid={validated && !consumo_id.trim()}
                    />
                    <Form.Control.Feedback type="invalid">
                        El ID del consumo es obligatorio.
                    </Form.Control.Feedback>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="primary" onClick={handleBuscar}>Editar</Button>
            </Modal.Footer>
        </Modal>
    );
}



