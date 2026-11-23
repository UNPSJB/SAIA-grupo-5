import { useState } from "react";
import { mutate } from "swr";
import { Container, Alert, Row, Col, Card, Button, Table, Tab } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ActionButton } from "../../../components/ActionButton";
import { PageHeader } from "../../../components/PageHeader";
import { AppTabs } from "../../../components/AppTabs";
import { Dato } from "../../../components/Dato";
import { EstadoBadge, type TonoEstado } from "../../../components/EstadoBadge";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";
import type { SupervisionOcurrencia } from "../../ChecklistSupervision/types";
import type { LoteProduccion, EstadoLote } from "../types";
import { PageLoading } from "../../../components/PageLoading";
import { AsociarInsumosModal } from "../components/AsociarInsumosModal";
import { TarjetaTrazabilidadLote } from "../components/TarjetaTrazabilidadLote";
import { ListaIncidentesVinculados } from "../../Incidentes/components/ListaIncidentesVinculados";
import { CambiarAlmacenamientoModal } from "../../Equipos/components/CambiarAlmacenamientoModal";
import type { EnvioLote } from "../../EnviosLote/types";
import { CrearEnvioModal } from "../../EnviosLote/components/CrearEnvioLoteModal";
import { RecepcionEnvioModal } from "../../EnviosLote/components/RecepcionEnvioLoteModal";
import { VerEnvioLoteModal } from "../../EnviosLote/components/VerEnvioLoteModal";
import { LineaTemporalEstadosLoteProduccion } from "../components/LineaTemporalEstadosLoteProduccion";

const ESTADO: Record<EstadoLote, { tono: TonoEstado; icono: string }> = {
    "En produccion": { tono: "warning", icono: "bi-gear-wide-connected" },
    "Empaquetando": { tono: "info", icono: "bi-box-seam" },
    "Terminado": { tono: "success", icono: "bi-check2-circle" },
    "Parcialmente despachado": { tono: "info", icono: "bi-truck" },
    "Enviado": { tono: "secondary", icono: "bi-truck" },
};

const formatearFechaReceta = (fecha: string | null) =>
    fecha ? new Date(fecha).toLocaleDateString("es-AR") : "—";

export function VerLoteProduccionPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [mostrarAsociarInsumos, setMostrarAsociarInsumos] = useState(false);
    const [mostrarCrearEnvio, setMostrarCrearEnvio] = useState(false);
    const [mostrarModalAlmacenamiento, setMostrarModalAlmacenamiento] = useState(false);
    const [envioParaRecepcion, setEnvioParaRecepcion] = useState<EnvioLote | null>(null);
    const [envioParaDetalle, setEnvioParaDetalle] = useState<EnvioLote | null>(null);

    const { data: envios } = useApi<EnvioLote[]>(id ? `/envios-lote/lote/${id}` : null);
    const { data: lote, isLoading, error } = useApi<LoteProduccion>(`/lotes-produccion/${id}`);
    const { data: supervisiones } = useApi<SupervisionOcurrencia[]>(id ? `/supervision-lotes/lote/${id}` : null);
    const puedeCambiarAlmacenamiento = Boolean(
        (currentUser?.operar || currentUser?.supervisor) &&
        lote?.activo &&
        lote?.estado !== "Enviado"
    );

    const location = useLocation();
    const origen = location.state?.origen;
    const volverA = origen === "historial"
        ? "/lotes-historial"
        : "/lotes-produccion/";

    const tituloPagina = "Detalle del Lote de Produccion";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!lote || error) return (
        <Container>
            <PageHeader title="Lote de Produccion no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrió un error al cargar los datos." : "El lote de produccion ingresado no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    const estado = ESTADO[lote.estado] ?? ESTADO["En produccion"];
    const fechaProdFormateada = lote.fecha_produccion.split("-").reverse().join("/");
    const fechaVencFormateada = lote.fecha_vencimiento.split("-").reverse().join("/");
    const insumosUtilizados = lote.insumos_utilizados ?? [];
    const puedeAsociar = currentUser?.operar && lote.activo && lote.estado === "En produccion";
    const stockActual = lote.cantidad_disponible ?? lote.cantidad_producida;
    const puedeDespachar = currentUser?.operar && (lote.estado === "Terminado" || lote.estado === "Parcialmente despachado") && stockActual > 0;

    const handleAsociado = () => {
        mutate(`/lotes-produccion/${id}`);
        mutate(`/lotes-produccion/${id}/trazabilidad`);
        mutate("/insumos-lote/");
        setMostrarAsociarInsumos(false);
    };

    const handleEnvioActualizado = () => {
        mutate(`/lotes-produccion/${id}`);
        mutate(`/envios-lote/lote/${id}`);
        mutate(`/lotes-produccion/${id}/trazabilidad`);
    };

    const manejarVerEnvio = (envioId: number) => {
        const envioEncontrado = envios?.find((e) => e.id === envioId);
        if (envioEncontrado) {
            setEnvioParaDetalle(envioEncontrado);
        }
    };

    const manejarRegistrarRecepcion = (envioId: number) => {
        const envioEncontrado = envios?.find((e) => e.id === envioId);
        if (envioEncontrado) {
            setEnvioParaRecepcion(envioEncontrado);
        }
    };

    const listaSupervisiones = supervisiones ?? [];
    const enFaseProductiva = lote.estado === "En produccion" || lote.estado === "Empaquetando";
    const pasosFase = enFaseProductiva
        ? listaSupervisiones.filter((item) => item.fase_lote_snap === lote.estado)
        : listaSupervisiones;
    const pasosCompletados = pasosFase.filter((item) => item.estado === "Completada").length;

    return (
        <Container>
            <PageHeader title={tituloPagina} />

            <AppTabs defaultActiveKey="general" id="secciones-lote-produccion" className="mb-3 mt-3" mountOnEnter>
                <Tab eventKey="general" title="Información general">
                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                        <Card.Body className="p-4">
                            <h6 className="detalle-seccion-titulo">Producto</h6>
                            <Row className="g-3 mb-4">
                                <Dato etiqueta="Producto" md={6} lg={lote.producto.foto_producto ? 3 : 4}>
                                    <span className="fw-semibold">{lote.producto.nombre}</span>
                                </Dato>
                                <Dato etiqueta="Cantidad neta" md={6} lg={lote.producto.foto_producto ? 3 : 4}>
                                    {lote.producto.cantidad_neta} {lote.producto.unidad_medida?.nombre}
                                </Dato>
                                <Dato etiqueta="Receta utilizada" md={6} lg={lote.producto.foto_producto ? 3 : 4}>
                                    {lote.receta ? (
                                        <>
                                            <div className="d-flex flex-wrap align-items-center gap-2">
                                                <span className="fw-semibold">Versión {lote.receta.version}</span>
                                                {lote.receta.vigente && <EstadoBadge tono="success">Vigente</EstadoBadge>}
                                            </div>
                                            {!lote.receta.vigente && (
                                                <div className="text-muted small">
                                                    {formatearFechaReceta(lote.receta.fecha_desde_vigencia)} al {formatearFechaReceta(lote.receta.fecha_hasta_vigencia)}
                                                </div>
                                            )}
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="p-0"
                                                onClick={() => navigate(`/productos/${lote.producto_id}/receta`, { state: { recetaId: lote.receta?.id } })}
                                            >
                                                <i className="bi bi-journal-text me-1"></i>Ver receta
                                            </Button>
                                        </>
                                    ) : (
                                        <span className="text-muted fst-italic">Sin receta registrada</span>
                                    )}
                                </Dato>
                                {lote.producto.foto_producto && (
                                    <Dato etiqueta="Foto del producto" md={6} lg={3}>
                                        <img
                                            src={lote.producto.foto_producto}
                                            alt={lote.producto.nombre}
                                            style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '8px', objectFit: 'cover' }}
                                            className="border shadow-sm p-1 bg-white"
                                        />
                                    </Dato>
                                )}
                            </Row>

                            <h6 className="detalle-seccion-titulo">Producción</h6>
                            <Row className="g-3">
                                <Dato etiqueta="Estado actual" md={6} lg={3}>
                                    <EstadoBadge tono={estado.tono} icono={estado.icono}>{lote.estado}</EstadoBadge>
                                </Dato>
                                <Dato etiqueta="Stock disponible / producido" md={6} lg={3}>
                                    <strong className="text-success">{stockActual}</strong> / {lote.cantidad_producida}
                                </Dato>
                                <Dato etiqueta="Fecha de producción" md={6} lg={3}>{fechaProdFormateada}</Dato>
                                <Dato etiqueta="Fecha de vencimiento" md={6} lg={3}>{fechaVencFormateada}</Dato>
                                <Dato etiqueta="Almacenamiento" md={6}>
                                    <div className="d-flex align-items-center gap-2">
                                        {lote.equipo ? (
                                            <Button
                                                variant="link"
                                                className="p-0 fw-semibold text-decoration-none text-start"
                                                onClick={() => navigate(`/equipos/${lote.equipo?.id}`)}
                                            >
                                                <i className="bi bi-thermometer-half me-1"></i>
                                                {lote.equipo.nombre}
                                                {lote.equipo.sector ? ` (${lote.equipo.sector.nombre})` : ''}
                                            </Button>
                                        ) : lote.sector ? (
                                            <span>
                                                <i className="bi bi-geo-alt me-1 text-secondary"></i>
                                                Sector: <strong>{lote.sector.nombre}</strong>
                                            </span>
                                        ) : (
                                            <span className="text-muted">Sin ubicación asignada</span>
                                        )}
                                        {puedeCambiarAlmacenamiento && (
                                            <ActionButton
                                                variant="outline-primary"
                                                size="sm"
                                                tooltip="Cambiar almacenamiento"
                                                icon="bi-pencil"
                                                onClick={() => setMostrarModalAlmacenamiento(true)}
                                            />
                                        )}
                                    </div>
                                </Dato>
                                <Dato etiqueta="Checklist de supervisión" md={6}>
                                    {pasosFase.length === 0 ? (
                                        <span className="text-muted">Sin pasos registrados</span>
                                    ) : (
                                        <div className="d-flex flex-wrap align-items-center gap-2">
                                            <EstadoBadge tono={pasosCompletados === pasosFase.length ? "success" : "warning"}>
                                                {pasosCompletados} / {pasosFase.length} pasos completados
                                                {enFaseProductiva ? ` (${lote.estado})` : ""}
                                            </EstadoBadge>
                                            {enFaseProductiva && (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => navigate(`/checklist-supervision?lote_id=${lote.id}`)}
                                                >
                                                    <i className="bi bi-check2-square me-1"></i>
                                                    Ir al checklist
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </Dato>
                            </Row>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="insumos" title="Insumos y línea de tiempo">
                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                        <Card.Body className="p-4">
                            <h6 className="detalle-seccion-titulo d-flex justify-content-between align-items-center gap-2">
                                <span>Insumos utilizados</span>
                                {puedeAsociar && (
                                    <Button variant="outline-primary" size="sm" onClick={() => setMostrarAsociarInsumos(true)}>
                                        <i className={`bi ${insumosUtilizados.length > 0 ? "bi-pencil" : "bi-plus-circle"} me-1`}></i>
                                        {insumosUtilizados.length > 0 ? "Modificar insumos" : "Asociar insumos"}
                                    </Button>
                                )}
                            </h6>
                            {insumosUtilizados.length === 0 ? (
                                <p className="text-muted mb-0">Este lote todavía no tiene insumos asociados.</p>
                            ) : (
                                <Table responsive bordered hover size="sm" className="mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Insumo</th>
                                            <th>Lote de Origen</th>
                                            <th>Proveedor</th>
                                            <th>Cantidad utilizada</th>
                                            <th>Unidad de medida</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {insumosUtilizados.map((registro) => {
                                            const loteProv = registro.insumo_lote?.lote_proveedor;
                                            const proveedor = loteProv?.proveedor;

                                            return (
                                                <tr key={registro.id}>
                                                    <td>
                                                        <strong>{registro.insumo_lote?.insumo?.nombre || 'Insumo'}</strong>{' '}
                                                        <span className="text-muted small">({registro.insumo_lote?.marca})</span>
                                                    </td>
                                                    <td>
                                                        {loteProv ? (
                                                            <Button
                                                                variant="link"
                                                                className="p-0 fw-bold text-decoration-none d-inline-flex align-items-center gap-1"
                                                                onClick={() => navigate(`/recepciones/${loteProv.id}`)}
                                                                title="Ir a la recepcion de origen"
                                                            >
                                                                <i className="bi bi-box-arrow-up-right small"></i>
                                                                {registro.insumo_lote?.numero_lote || loteProv.numero_remito || `#${loteProv.id}`}
                                                            </Button>
                                                        ) : (
                                                            <span className="text-muted">{registro.insumo_lote?.numero_lote || '-'}</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {proveedor ? (
                                                            <Button
                                                                variant="link"
                                                                className="p-0 text-decoration-none fw-semibold text-secondary d-inline-flex align-items-center gap-1"
                                                                onClick={() => navigate(`/proveedores/${proveedor.id}`)}
                                                                title="Ver detalle del proveedor"
                                                            >
                                                                <i className="bi bi-building small"></i>
                                                                {proveedor.nombre}
                                                            </Button>
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
                                                    </td>
                                                    <td>{Number(registro.cantidad_utilizada).toLocaleString("es-AR", { maximumFractionDigits: 3 })}</td>
                                                    <td>{registro.insumo_lote?.insumo?.unidad_medida?.nombre || 'U'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>

                    <LineaTemporalEstadosLoteProduccion lote={lote} />
                </Tab>

                <Tab eventKey="trazabilidad" title="Trazabilidad">
                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                        <Card.Body className="p-4">
                            <TarjetaTrazabilidadLote
                                modo="lote_produccion"
                                entidadId={lote.id}
                                puedeDespachar={puedeDespachar}
                                onNuevoEnvio={() => setMostrarCrearEnvio(true)}
                                onVerEnvio={manejarVerEnvio}
                                onRegistrarRecepcion={currentUser?.operar ? manejarRegistrarRecepcion : undefined}
                            />
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="incidentes" title="Incidentes vinculados">
                    <ListaIncidentesVinculados loteProduccionId={lote.id} />
                </Tab>
            </AppTabs>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
                <Button
                    variant="outline-secondary"
                    onClick={() => navigate(volverA)}
                >
                    <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                </Button>

                {currentUser?.operar && (
                    <Button
                        variant="primary"
                        disabled={lote.estado === "Enviado" || lote.estado === "Parcialmente despachado"}
                        onClick={() => navigate(`/lotes-produccion/${lote.id}/edit`)}
                    >
                        <i className="bi bi-pencil me-1"></i>Editar Lote
                    </Button>
                )}
            </div>

            {mostrarAsociarInsumos && (
                <AsociarInsumosModal
                    loteId={lote.id}
                    insumosAsociados={insumosUtilizados}
                    onHide={() => setMostrarAsociarInsumos(false)}
                    onAsociado={handleAsociado}
                />
            )}
            <CrearEnvioModal
                lote={mostrarCrearEnvio ? lote : null}
                onHide={() => setMostrarCrearEnvio(false)}
                onEnviado={handleEnvioActualizado}
            />
            {envioParaRecepcion && (
                <RecepcionEnvioModal
                    envio={envioParaRecepcion}
                    onHide={() => setEnvioParaRecepcion(null)}
                    onRecepcionado={handleEnvioActualizado}
                />
            )}
            <VerEnvioLoteModal
                envio={envioParaDetalle}
                onHide={() => setEnvioParaDetalle(null)}
            />
            <CambiarAlmacenamientoModal
                show={mostrarModalAlmacenamiento}
                onHide={() => setMostrarModalAlmacenamiento(false)}
                tipo="lote_produccion"
                entidadId={lote.id}
                etiqueta={`Lote de Produccion #${lote.id} - ${lote.producto.nombre}`}
                equipoActualId={lote.equipo_id ?? lote.equipo?.id ?? null}
                sectorActualId={lote.sector_id ?? lote.sector?.id ?? null}
                onActualizado={() => mutate(`/lotes-produccion/${id}`)}
            />
        </Container>
    );
}
