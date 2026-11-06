import { Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface AgregarConsumoModalProps {
    show: boolean;
    onHide: () => void;
    onAhoraNo: () => void;
    tareaId: number | null;
}

export function AgregarConsumoModal({ show, onHide, tareaId, onAhoraNo, }: AgregarConsumoModalProps) {
    const navigate = useNavigate();

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header>
                <Modal.Title>Insumos químicos</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                Tarea creada.
                <br />
                ¿Querés agregar insumos químicos a utilizar en esta tarea?
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onAhoraNo}> Ahora no 
                </Button>
                <Button variant="primary" onClick={() => {
                    if (tareaId === null) return;
                    navigate(`/consumos-productos/tarea/${tareaId}`);}}
                >
                    Agregar insumo </Button>
            </Modal.Footer>
        </Modal>
    );
}

