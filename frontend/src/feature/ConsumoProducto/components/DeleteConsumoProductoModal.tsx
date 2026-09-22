import { Button, Modal, Form } from "react-bootstrap";
import { api } from "../../../libs/axios";
import { useState } from "react";

interface DeleteConsumoProductoModalProps {
    show: boolean;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteConsumoProductoModal({ show, onHide, onDeleted }: DeleteConsumoProductoModalProps) {
    const [consumo_id, setConsumoId] = useState("");
    const [validated, setValidated] = useState(false);

    const handleDelete = async () => {
        setValidated(true);
        if (!consumo_id.trim()) return;

        await api.delete(`/consumos_productos/${consumo_id}`);
        onDeleted();
        onHide();
        setConsumoId("");
        setValidated(false);
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Eliminar consumo registrado</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3 text-start" controlId="formConsumoId">
                    <Form.Label className="p-1 fw-bold"> Consumo </Form.Label>
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
                <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
            </Modal.Footer>
        </Modal>
    );
}

