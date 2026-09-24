import { Badge, Button, Modal } from "react-bootstrap";
import { FRECUENCIA_LABELS, getRelacionNombre, getRelacionTipoLabel, PRIORIDAD_LABELS, PRIORIDAD_VARIANTS } from "../types";
import type { Tarea } from "../types";

interface TareaDetalleModalProps {
    tarea: Tarea | null;
    onHide: () => void;
    onEditar: () => void;
    onEliminar: () => void;
}

export function TareaDetalleModal({ tarea, onHide, onEditar, onEliminar }: TareaDetalleModalProps) {
    return (
        <Modal show={tarea !== null} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{tarea?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {tarea && (
                    <>
                        <p>{tarea.descripcion || "Sin descripción."}</p>

                        {tarea.procedimiento && tarea.procedimiento.length > 0 && (
                            <>
                                <h6 className="fw-bold">Procedimiento</h6>
                                <ol>
                                    {tarea.procedimiento.map((paso, indice) => (
                                        <li key={indice}>{paso}</li>
                                    ))}
                                </ol>
                            </>
                        )}

                        <dl className="row mb-0 align-items-center">
                            <dt className="col-sm-4">{getRelacionTipoLabel(tarea)}</dt>
                            <dd className="col-sm-8">{getRelacionNombre(tarea)}</dd>

                            <dt className="col-sm-4">Frecuencia</dt>
                            <dd className="col-sm-8">{FRECUENCIA_LABELS[tarea.frecuencia]}</dd>

                            <dt className="col-sm-4">Prioridad</dt>
                            <dd className="col-sm-8">
                                <Badge bg={PRIORIDAD_VARIANTS[tarea.prioridad]}>
                                    {PRIORIDAD_LABELS[tarea.prioridad]}
                                </Badge>
                            </dd>

                            <dt className="col-sm-4">Foto obligatoria</dt>
                            <dd className="col-sm-8">{tarea.foto_obligatoria ? "Sí" : "No"}</dd>

                            <dt className="col-sm-4">Acción correctiva</dt>
                            <dd className="col-sm-8">{tarea.accion_correctiva || "No especificada."}</dd>

                            <dt className="col-sm-4">Elementos de limpieza</dt>
                            <dd className="col-sm-8 text-muted">
                                Todavía no disponible.
                            </dd>
                        </dl>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={onEliminar}>
                    <i className="bi bi-trash3 me-1"></i>Eliminar tarea
                </Button>
                <Button variant="outline-primary" onClick={onEditar}>
                    <i className="bi bi-pencil me-1"></i>Editar tarea
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
