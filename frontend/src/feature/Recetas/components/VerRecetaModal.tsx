import { Accordion, Button, ListGroup, Modal, Spinner } from 'react-bootstrap';
import { useApi } from '../../../hooks/useApi';
import type { Producto } from '../../Productos/types';
import type { Receta } from '../types';

interface VerRecetaModalProps {
    producto: Producto | null;
    onHide: () => void;
}

export function VerRecetaModal({ producto, onHide }: VerRecetaModalProps) {
    const { data: receta, error, isLoading } = useApi<Receta>(
        producto ? `/recetas/producto/${producto.id}` : null,
    );

    return (
        <Modal show={producto !== null} onHide={onHide} size="lg" scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Receta</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-3"><strong>Producto:</strong> {producto?.nombre}</p>

                {isLoading ? (
                    <div className="d-flex align-items-center gap-2 text-muted">
                        <Spinner animation="border" size="sm" /> Cargando receta…
                    </div>
                ) : error || !receta ? (
                    <p className="text-muted">No se pudo cargar la receta.</p>
                ) : (
                    <Accordion alwaysOpen defaultActiveKey={receta.etapas.map((etapa) => String(etapa.id))}>
                        {receta.etapas.map((etapa) => (
                            <Accordion.Item key={etapa.id} eventKey={String(etapa.id)}>
                                <Accordion.Header>
                                    <span className="fw-semibold me-2">{etapa.orden}.</span>
                                    {etapa.nombre}
                                    <span className="text-muted small ms-2">({etapa.pasos.length} {etapa.pasos.length === 1 ? 'paso' : 'pasos'})</span>
                                </Accordion.Header>
                                <Accordion.Body className="p-0">
                                    <ListGroup variant="flush">
                                        {etapa.pasos.map((paso) => (
                                            <ListGroup.Item key={paso.id} className="d-flex gap-2 text-start">
                                                <span className="text-muted" style={{ minWidth: '1.5rem' }}>{paso.orden}.</span>
                                                {paso.descripcion}
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
}
