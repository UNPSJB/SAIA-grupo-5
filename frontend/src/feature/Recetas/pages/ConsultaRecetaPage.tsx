import { useState } from 'react';
import { Accordion, Alert, Button, Container, ListGroup, Offcanvas, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { EstadoBadge } from '../../../components/EstadoBadge';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { useApi } from '../../../hooks/useApi';
import type { InformacionNutricionalReceta } from '../../CalculoNutricional/types';
import type { Producto } from '../../Productos/types';
import type { InsumoReceta, Receta, RecetaVersion } from '../types';
import './ConsultaReceta.css';

const formatearFecha = (fecha: string | null) =>
    fecha ? new Date(fecha).toLocaleDateString('es-AR') : '-';

const formatearCantidad = (valor: number) => valor.toLocaleString('es-AR', { maximumFractionDigits: 2 });

function ListaRenglones({ titulo, renglones }: { titulo: string; renglones: InsumoReceta[] }) {
    if (renglones.length === 0) return null;
    return (
        <section className="consulta-receta-seccion">
            <h2 className="consulta-receta-titulo">{titulo}</h2>
            <ul className="consulta-receta-renglones">
                {renglones.map((renglon) => (
                    <li key={renglon.id}>
                        <span className="consulta-receta-nombre">{renglon.aditivo?.nombre ?? renglon.nombre}</span>
                        <span className="consulta-receta-cantidad">
                            {formatearCantidad(renglon.cantidad)} <small>{renglon.unidad_medida.nombre}</small>
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

// Consulta de receta de solo lectura, pensada para usar desde el celular en la planta.
export function ConsultaRecetaPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    // null = versión vigente. Las anteriores solo se ven tras abrir el historial.
    const [versionId, setVersionId] = useState<number | null>(null);
    const [mostrarHistorial, setMostrarHistorial] = useState(false);

    const { data: producto, isLoading: cargandoProducto } = useApi<Producto>(`/productos/${id}`);
    const { data: receta, isLoading: cargandoReceta, error } = useApi<Receta>(
        versionId ? `/recetas/${versionId}` : `/recetas/producto/${id}`,
    );
    const { data: versiones, isLoading: cargandoVersiones } = useApi<RecetaVersion[]>(
        mostrarHistorial ? `/recetas/producto/${id}/versiones` : null,
    );
    const { data: nutricional, isLoading: cargandoNutricional } = useApi<InformacionNutricionalReceta>(
        receta ? `/calculo-nutricional/recetas/${receta.id}` : null,
    );

    const titulo = producto?.nombre ?? 'Receta';

    if (cargandoProducto || (cargandoReceta && !receta)) return <PageLoading title={titulo} />;

    if (error || !receta) return (
        <Container className="consulta-receta">
            <PageHeader eyebrow="RECETA" title={titulo} />
            <Alert variant="warning">Este producto no tiene una receta vigente.</Alert>
            <Button variant="outline-secondary" onClick={() => navigate('/recetas')}>
                <i className="bi bi-arrow-left me-1"></i>Volver a recetas
            </Button>
        </Container>
    );

    const ingredientes = receta.insumos.filter((item) => item.tipo === 'Ingrediente');
    const aditivos = receta.insumos.filter((item) => item.tipo === 'Aditivo');

    const elegirVersion = (version: RecetaVersion) => {
        setVersionId(version.vigente ? null : version.id);
        setMostrarHistorial(false);
    };

    return (
        <Container className="consulta-receta">
            <PageHeader eyebrow="RECETA" title={titulo} />

            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <span className="fw-bold">Versión {receta.version}</span>
                {receta.vigente ? (
                    <EstadoBadge tono="success" icono="bi-check-circle-fill">Vigente</EstadoBadge>
                ) : (
                    <EstadoBadge tono="secondary" icono="bi-lock-fill">Solo lectura</EstadoBadge>
                )}
                <small className="text-muted">
                    {receta.vigente
                        ? `desde ${formatearFecha(receta.fecha_desde_vigencia ?? receta.fecha_creacion)}`
                        : `del ${formatearFecha(receta.fecha_desde_vigencia)} al ${formatearFecha(receta.fecha_hasta_vigencia)}`}
                </small>
            </div>

            {!receta.vigente && (
                <Alert variant="warning" className="d-flex flex-column gap-2">
                    <span>
                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                        Estás viendo una <strong>versión anterior</strong>. No la uses para elaborar.
                    </span>
                    <Button variant="warning" size="sm" className="align-self-start" onClick={() => setVersionId(null)}>
                        Volver a la versión vigente
                    </Button>
                </Alert>
            )}

            <div className="consulta-receta-resumen">
                <div>
                    <span>Porción</span>
                    <strong>
                        {receta.porcion !== null
                            ? `${formatearCantidad(receta.porcion)} ${receta.porcion_unidad_medida?.nombre ?? ''}`
                            : 'Sin indicar'}
                    </strong>
                </div>
                <div>
                    <span>Rendimiento</span>
                    <strong>
                        {cargandoNutricional
                            ? <Spinner animation="border" size="sm" />
                            : nutricional ? `${formatearCantidad(nutricional.rendimiento)} g` : 'Sin calcular'}
                    </strong>
                </div>
            </div>

            <ListaRenglones titulo="Ingredientes" renglones={ingredientes} />
            <ListaRenglones titulo="Aditivos" renglones={aditivos} />

            {receta.etapas.length > 0 && (
                <section className="consulta-receta-seccion">
                    <h2 className="consulta-receta-titulo">Etapas y pasos</h2>
                    <Accordion alwaysOpen>
                        {receta.etapas.map((etapa) => (
                            <Accordion.Item key={etapa.id} eventKey={String(etapa.id)}>
                                <Accordion.Header>
                                    <span className="fw-semibold me-2">{etapa.orden}.</span>
                                    {etapa.nombre}
                                </Accordion.Header>
                                <Accordion.Body className="p-0">
                                    <ListGroup variant="flush">
                                        {etapa.pasos.map((paso) => (
                                            <ListGroup.Item key={paso.id} className="d-flex gap-2 text-start">
                                                <span className="text-muted">{paso.orden}.</span>
                                                {paso.descripcion}
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </section>
            )}

            <div className="consulta-receta-acciones">
                <Button variant="outline-secondary" onClick={() => navigate('/recetas')} aria-label="Volver a recetas">
                    <i className="bi bi-arrow-left"></i>
                </Button>
                <Button variant="outline-primary" className="flex-grow-1" onClick={() => setMostrarHistorial(true)}>
                    <i className="bi bi-clock-history me-1"></i>Ver historial
                </Button>
                {receta.vigente && (
                    <Button variant="primary" className="flex-grow-1" onClick={() => navigate(`/recetas/${id}/escalar`)}>
                        <i className="bi bi-arrows-angle-expand me-1"></i>Escalar
                    </Button>
                )}
            </div>

            <Offcanvas show={mostrarHistorial} onHide={() => setMostrarHistorial(false)} placement="bottom" className="consulta-receta-historial">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Historial de versiones</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="pt-0">
                    {cargandoVersiones ? (
                        <div className="text-muted"><Spinner animation="border" size="sm" className="me-2" />Cargando…</div>
                    ) : (
                        <ListGroup>
                            {(versiones ?? []).map((version) => (
                                <ListGroup.Item
                                    key={version.id}
                                    action
                                    active={version.id === receta.id}
                                    onClick={() => elegirVersion(version)}
                                    className="d-flex justify-content-between align-items-center gap-2"
                                >
                                    <span className="text-start">
                                        <span className="d-block fw-semibold">Versión {version.version}</span>
                                        <small>
                                            {version.vigente
                                                ? `Vigente desde ${formatearFecha(version.fecha_desde_vigencia ?? version.fecha_creacion)}`
                                                : `${formatearFecha(version.fecha_desde_vigencia)} al ${formatearFecha(version.fecha_hasta_vigencia)}`}
                                        </small>
                                    </span>
                                    {version.vigente
                                        ? <i className="bi bi-check-circle-fill"></i>
                                        : <i className="bi bi-lock"></i>}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Offcanvas.Body>
            </Offcanvas>
        </Container>
    );
}
