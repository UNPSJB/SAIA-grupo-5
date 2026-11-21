import { useState } from 'react';
import { Accordion, Alert, Button, Form, ListGroup, Modal, Spinner } from 'react-bootstrap';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import { EstadoBadge } from '../../../components/EstadoBadge';
import type { Producto } from '../../Productos/types';
import type { Receta, RecetaVersion } from '../types';
import { SellosFrontales } from './SellosFrontales';
import { InfoNutricionalReceta } from "../../CalculoNutricional/components/InfoNutricionalRecetaForm";
import { IngredientesComposicion } from './IngredientesComposicion';
import { AlergenosReceta } from "../../Alergenos/components/AlergenosRecetaForm";
import "./VerRecetaModal.css";

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
    const { currentUser } = useAuth();
    const [seleccion, setSeleccion] = useState<{ productoId: number; recetaId: number } | null>(null);
    const recetaSeleccionadaId = seleccion && seleccion.productoId === producto?.id ? seleccion.recetaId : null;

    const { data: versiones } = useApi<RecetaVersion[]>(producto ? `/recetas/producto/${producto.id}/versiones` : null);
    const { data: receta, error, isLoading } = useApi<Receta>(
        !producto ? null : recetaSeleccionadaId ? `/recetas/${recetaSeleccionadaId}` : `/recetas/producto/${producto.id}`,
    );

    return (
        <Modal show={producto !== null} onHide={onHide} size="xl" scrollable>
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
                                <div className="text-muted small">Porción o unidad de venta</div>
                                <div className="fw-semibold">
                                    {receta.porcion !== null
                                        ? `${receta.porcion} ${receta.porcion_unidad_medida?.nombre ?? ''}`
                                        : <span className="text-muted fst-italic">Sin indicar</span>}
                                </div>
                            </ListGroup.Item>
                        </ListGroup>
                        <Tabs defaultActiveKey="etapas" id="secciones-receta" className="mb-3 receta-tabs" mountOnEnter>
                            <Tab eventKey="etapas" title="Etapas y pasos">
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
                            </Tab>
                            <Tab eventKey="sellos" title="Sellos de advertencia">
                                <SellosFrontales evaluacion={receta.sellos} />
                            </Tab>
                            <Tab eventKey="ingredientes" title="Ingredientes y composición">
                                <IngredientesComposicion insumos={receta.insumos} mostrarComposicion={!!currentUser?.administrar} />
                            </Tab>
                            <Tab eventKey="alergenos" title="Alérgenos y Gluten">
                                <AlergenosReceta recetaId={receta.id} recetaVigente={receta.vigente} />
                            </Tab>
                            <Tab eventKey="informacion_nutricional" title="Información Nutricional">
                                <div className="text-start"> <InfoNutricionalReceta recetaId={receta.id} /></div>
                            </Tab>
                        </Tabs>
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

