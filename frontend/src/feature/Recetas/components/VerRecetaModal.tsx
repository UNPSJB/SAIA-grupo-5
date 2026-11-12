import { Accordion, Button, ListGroup, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import type { Producto } from '../../Productos/types';
import type { Receta } from '../types';
import { SellosFrontales } from './SellosFrontales';

interface VerRecetaModalProps {
    producto: Producto | null;
    onHide: () => void;
    // revisar permisos (administrar, operar o supervisar)
    onEditar?: (receta: Receta) => void;
}

export function VerRecetaModal({ producto, onHide, onEditar }: VerRecetaModalProps) {
    const navigate = useNavigate();
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
                    <>
                        <h6 className="fw-bold text-start mb-2">Ingredientes por unidad de producto</h6>
                        {receta.insumos.length === 0 ? (
                            <p className="text-muted small fst-italic text-start">La receta no tiene ingredientes cargados.</p>
                        ) : (
                            <ListGroup className="mb-3">
                                {receta.insumos.map((item) => (
                                    <ListGroup.Item key={item.id} className="d-flex justify-content-between text-start">
                                        <span>{item.nombre}</span>
                                        <span className="fw-semibold">{item.cantidad} {item.unidad_medida.nombre}</span>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                        <SellosFrontales evaluacion={receta.sellos} />

                        <h6 className="fw-bold text-start mt-4 mb-2">Etapas y pasos</h6>
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
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    className="me-auto"
                    variant="primary"
                    disabled={!receta}
                    onClick={() => producto && navigate(`/productos/${producto.id}/receta/escalar`)}
                >
                    Escalar
                </Button>
                <Button variant="secondary" onClick={onHide}>Cerrar</Button>
                {onEditar && receta && (
                    <Button className="ms-2" variant="primary" onClick={() => onEditar(receta)}>
                        <i className="bi bi-pencil me-1"></i> Editar receta
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}
