import { useState } from 'react';
import { mutate } from 'swr';
import { Accordion, Alert, Button, Card, Container, Form, ListGroup, Spinner } from 'react-bootstrap';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import { EstadoBadge } from '../../../components/EstadoBadge';
import { PageHeader } from '../../../components/PageHeader';
import type { Producto } from '../../Productos/types';
import type { Receta, RecetaVersion } from '../types';
import { RecetaFormModal } from '../components/RecetaFormModal';
import { SellosFrontales } from '../components/SellosFrontales';
import { InfoNutricionalReceta } from '../../CalculoNutricional/components/InfoNutricionalRecetaForm';
import { IngredientesComposicion } from '../components/IngredientesComposicion';
import { AlergenosReceta } from '../../Alergenos/components/AlergenosRecetaForm';
import type { UnidadMedida } from '../../UnidadMedida/types';
import { exportarRecetaPdf } from '../ExportRecetapdf';

const formatearFecha = (fecha: string | null) =>
    fecha ? new Date(fecha).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }) : "-";

const etiquetaVersion = (version: RecetaVersion) =>
    version.vigente
        ? `Versión ${version.version} · vigente`
        : `Versión ${version.version} · ${formatearFecha(version.fecha_desde_vigencia)} al ${formatearFecha(version.fecha_hasta_vigencia)}`;

export function VerRecetaPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [recetaSeleccionadaId, setRecetaSeleccionadaId] = useState<number | null>(null);
    const [recetaEditar, setRecetaEditar] = useState<Receta | null>(null);

    const productoId = Number(id);
    const { data: producto, isLoading: cargandoProducto, error: errorProducto } = useApi<Producto>(
        id && Number.isInteger(productoId) && productoId > 0 ? `/productos/${productoId}` : null
    );
    const { data: versiones } = useApi<RecetaVersion[]>(
        producto ? `/recetas/producto/${producto.id}/versiones` : null
    );
    const { data: receta, error, isLoading } = useApi<Receta>(
        !producto ? null : recetaSeleccionadaId
            ? `/recetas/${recetaSeleccionadaId}`
            : `/recetas/producto/${producto.id}`
    );
    const { data: unidades } = useApi<UnidadMedida[]>(currentUser?.administrar ? '/unidades-medida/' : null);

    const volver = () => navigate(`/productos/${productoId}`);

    const onSaved = (guardada: Receta) => {
        setRecetaEditar(null);
        setRecetaSeleccionadaId(null);
        mutate(`/recetas/producto/${productoId}`);
        mutate(`/recetas/producto/${productoId}/versiones`);
        mutate(`/recetas/${guardada.id}`);
        mutate(`/productos/${productoId}`);
        mutate('/productos/');
    };

    return (
        <Container fluid="lg">
            <PageHeader title="Detalle de receta" />

            <Card className="shadow-sm border-0 rounded-3 mt-3">
                <Card.Body className="p-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                        <Button variant="outline-secondary" onClick={volver}>
                            <i className="bi bi-arrow-left me-1"></i>Volver al producto
                        </Button>
                        <div className="d-flex flex-wrap gap-2">
                            <Button
                                variant="primary"
                                disabled={!receta?.vigente}
                                onClick={() => navigate(`/productos/${productoId}/receta/escalar`)}
                            >
                                Escalar
                            </Button>
                            <Button
                                variant="outline-primary"
                                disabled={!producto || !receta || (!!currentUser?.administrar && !unidades)}
                                onClick={() => producto && receta && exportarRecetaPdf({
                                    producto: producto.nombre,
                                    receta,
                                    unidades,
                                    mostrarComposicion: !!currentUser?.administrar,
                                })}
                            >
                                <i className="bi bi-download me-1"></i>Descargar receta
                            </Button>
                            {currentUser?.administrar && (
                                <Button variant="primary" disabled={!receta?.vigente} onClick={() => receta && setRecetaEditar(receta)}>
                                    <i className="bi bi-pencil me-1"></i>Editar receta
                                </Button>
                            )}
                        </div>
                    </div>

                    {cargandoProducto ? (
                        <div className="d-flex align-items-center gap-2 text-muted">
                            <Spinner animation="border" size="sm" /> Cargando producto…
                        </div>
                    ) : errorProducto || !producto ? (
                        <Alert variant="danger">No se pudo cargar el producto.</Alert>
                    ) : (
                        <>
                            <p className="mb-2"><strong>Producto:</strong> {producto.nombre}</p>

                            {versiones && versiones.length > 1 && (
                                <Form.Group className="mb-3 text-start" controlId="versionReceta">
                                    <Form.Label className="fw-bold small mb-1">Historial de versiones</Form.Label>
                                    <Form.Select
                                        size="sm"
                                        value={receta?.id ?? ""}
                                        onChange={(e) => setRecetaSeleccionadaId(Number(e.target.value))}
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

                                    <Tabs key={receta.id} defaultActiveKey="ingredientes" id="secciones-receta" className="mb-3 receta-tabs" mountOnEnter>
                                        <Tab eventKey="ingredientes" title="Ingredientes y composición">
                                            <IngredientesComposicion insumos={receta.insumos} mostrarComposicion={!!currentUser?.administrar} />
                                        </Tab>
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
                                        <Tab eventKey="alergenos" title="Alérgenos y Gluten">
                                            <AlergenosReceta recetaId={receta.id} recetaVigente={receta.vigente} />
                                        </Tab>
                                        <Tab eventKey="informacion_nutricional" title="Información Nutricional">
                                            <div className="text-start"><InfoNutricionalReceta recetaId={receta.id} /></div>
                                        </Tab>
                                    </Tabs>
                                </>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>

            {producto && (
                <RecetaFormModal
                    producto={recetaEditar ? producto : null}
                    receta={recetaEditar}
                    onHide={() => setRecetaEditar(null)}
                    onSaved={onSaved}
                />
            )}
        </Container>
    );
}
