import { useState } from 'react';
import { Accordion, Alert, Button, Form, ListGroup, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import { EstadoBadge } from '../../../components/EstadoBadge';
import type { Producto } from '../../Productos/types';
import type { Receta, RecetaVersion } from '../types';
import { SellosFrontales } from './SellosFrontales';

interface VerRecetaModalProps {
    producto: Producto | null;
    onHide: () => void;
    // revisar permisos (administrar, operar o supervisar)
    onEditar?: (receta: Receta) => void;
}

const formatearFecha = (fecha: string | null) =>
    fecha ? new Date(fecha).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }) : "-";

const etiquetaVersion = (version: RecetaVersion) =>
    version.vigente
        ? `Versión ${version.version} · vigente`
        : `Versión ${version.version} · ${formatearFecha(version.fecha_desde_vigencia)} al ${formatearFecha(version.fecha_hasta_vigencia)}`;

export function VerRecetaModal({ producto, onHide, onEditar }: VerRecetaModalProps) {
    const navigate = useNavigate();
    const [seleccion, setSeleccion] = useState<{ productoId: number; recetaId: number } | null>(null);
    const recetaSeleccionadaId = seleccion && seleccion.productoId === producto?.id ? seleccion.recetaId : null;

    const { data: versiones } = useApi<RecetaVersion[]>(producto ? `/recetas/producto/${producto.id}/versiones` : null);
    const { data: receta, error, isLoading } = useApi<Receta>(
        !producto ? null : recetaSeleccionadaId ? `/recetas/${recetaSeleccionadaId}` : `/recetas/producto/${producto.id}`,
    );

    const ingredientes = receta?.insumos.filter((item) => item.tipo === "Ingrediente") ?? [];
    const aditivos = receta?.insumos.filter((item) => item.tipo === "Aditivo") ?? [];

    return (
        <Modal show={producto !== null} onHide={onHide} size="lg" scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Receta</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-2"><strong>Producto:</strong> {producto?.nombre}</p>

                {versiones && versiones.length > 1 && (
                    <Form.Group className="mb-3 text-start" controlId="versionReceta">
                        <Form.Label className="fw-bold small mb-1">Historial de versiones</Form.Label>
                        <Form.Select
                            size="sm"
                            value={receta?.id ?? ""}
                            onChange={(e) => producto && setSeleccion({ productoId: producto.id, recetaId: Number(e.target.value) })}
                        >
                            {versiones.map((version) => (
                                <option key={version.id} value={version.id}>{etiquetaVersion(version)}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                )}

                {isLoading ? (
                    <div className="d-flex align-items-center gap-2 text-muted">
                        <Spinner animation="border" size="sm" /> Cargando receta…
                    </div>
                ) : error || !receta ? (
                    <p className="text-muted">No se pudo cargar la receta.</p>
                ) : (
                    <>
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-3 text-start">
                            <span className="fw-bold">Versión {receta.version}</span>
                            {receta.vigente ? (
                                <EstadoBadge tono="success" icono="bi-check-circle-fill">Vigente</EstadoBadge>
                            ) : (
                                <EstadoBadge tono="secondary" icono="bi-lock-fill">Solo lectura</EstadoBadge>
                            )}
                            <span className="text-muted small">
                                {receta.vigente
                                    ? `Vigente desde ${formatearFecha(receta.fecha_desde_vigencia ?? receta.fecha_creacion)}`
                                    : `Vigente del ${formatearFecha(receta.fecha_desde_vigencia)} al ${formatearFecha(receta.fecha_hasta_vigencia)}`}
                            </span>
                        </div>

                        {!receta.vigente && (
                            <Alert variant="secondary" className="small py-2 text-start">
                                <i className="bi bi-info-circle me-1"></i>
                                Estás viendo una versión anterior de la receta. Es de solo lectura.
                            </Alert>
                        )}

                        <ListGroup horizontal="sm" className="mb-3 text-start">
                            <ListGroup.Item className="flex-fill">
                                <div className="text-muted small">Rendimiento final</div>
                                <div className="fw-semibold">
                                    {receta.rendimiento !== null
                                        ? `${receta.rendimiento} ${receta.rendimiento_unidad_medida?.nombre ?? ''}`
                                        : <span className="text-muted fst-italic">Sin cargar</span>}
                                </div>
                            </ListGroup.Item>
                            <ListGroup.Item className="flex-fill">
                                <div className="text-muted small">Porción o unidad de venta</div>
                                <div className="fw-semibold">
                                    {receta.porcion !== null
                                        ? `${receta.porcion} ${receta.porcion_unidad_medida?.nombre ?? ''}`
                                        : <span className="text-muted fst-italic">Sin indicar</span>}
                                </div>
                            </ListGroup.Item>
                        </ListGroup>

                        <h6 className="fw-bold text-start mb-2">Ingredientes</h6>
                        {ingredientes.length === 0 ? (
                            <p className="text-muted small fst-italic text-start">La receta no tiene ingredientes cargados.</p>
                        ) : (
                            <ListGroup className="mb-3">
                                {ingredientes.map((item) => (
                                    <ListGroup.Item key={item.id} className="d-flex justify-content-between text-start">
                                        <span>{item.nombre}</span>
                                        <span className="fw-semibold">{item.cantidad} {item.unidad_medida.nombre}</span>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}

                        <h6 className="fw-bold text-start mb-2">Aditivos</h6>
                        {aditivos.length === 0 ? (
                            <p className="text-muted small fst-italic text-start">La receta no tiene aditivos.</p>
                        ) : (
                            <ListGroup className="mb-3">
                                {aditivos.map((item) => (
                                    <ListGroup.Item key={item.id} className="d-flex justify-content-between gap-2 text-start">
                                        <span>
                                            <span className="fw-semibold">{item.aditivo?.nombre}</span>
                                            <span className="text-muted small d-block">
                                                {item.aditivo?.clase_funcional}
                                                {item.aditivo?.numero_ins ? ` · INS ${item.aditivo.numero_ins}` : ''}
                                                {` · insumo: ${item.nombre}`}
                                            </span>
                                        </span>
                                        <span className="fw-semibold text-nowrap">{item.cantidad} {item.unidad_medida.nombre}</span>
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
                    disabled={!receta || !receta.vigente}
                    onClick={() => producto && navigate(`/productos/${producto.id}/receta/escalar`)}
                >
                    Escalar
                </Button>
                <Button variant="secondary" onClick={onHide}>Cerrar</Button>
                {onEditar && receta?.vigente && (
                    <Button className="ms-2" variant="primary" onClick={() => onEditar(receta)}>
                        <i className="bi bi-pencil me-1"></i> Editar receta
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}
