
import { useState } from "react";
import { mutate } from "swr";
import { Container, Alert, Row, Col, Card, Button, Table, Badge } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ActionButton } from "../../../components/ActionButton";
import { PageHeader } from "../../../components/PageHeader";
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

const ESTILOS_ESTADO: Record<EstadoLote, { bg: string; color: string; icon: string }> = {
    "En produccion": { bg: "#fef9c3", color: "#854d0e", icon: "bi-gear-wide-connected" },
    "Empaquetando": { bg: "#dbeafe", color: "#1e40af", icon: "bi-box-seam" },
    "Terminado": { bg: "#dcfce7", color: "#166534", icon: "bi-check2-circle" },
    "Parcialmente despachado": { bg: "#e0e7ff", color: "#3730a3", icon: "bi-truck" },
    "Enviado": { bg: "#f3f4f6", color: "#374151", icon: "bi-truck" },
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

    const estilo = ESTILOS_ESTADO[lote.estado] || ESTILOS_ESTADO["En produccion"];
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

    return (
        <Container>
            <PageHeader title={tituloPagina} />

            <Row className="justify-content-center mt-3">
                <Col xs={12}>
                    <Card className="shadow-sm border-0 rounded-3 mb-4">
                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Producto</Col>
                                <Col sm={7} className="fs-6 fw-semibold">{lote.producto.nombre}</Col>
                            </Row>

                            {lote.producto.foto_producto && (
                                <Row className="mb-3 border-bottom pb-3 align-items-center">
                                    <Col sm={5} className="fw-bold text-secondary">Foto del Producto</Col>
                                    <Col sm={7}>
                                        <img
                                            src={lote.producto.foto_producto}
                                            alt={lote.producto.nombre}
                                            style={{
                                                maxHeight: '140px',
                                                borderRadius: '8px',
                                                objectFit: 'cover'
                                            }}
                                            className="border shadow-sm p-1 bg-white"
                                        />
                                    </Col>
                                </Row>
                            )}

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Stock / Cantidad Producida</Col>
                                <Col sm={7} className="fs-6">
                                    <strong className="text-success">{lote.cantidad_disponible ?? lote.cantidad_producida}</strong> disponibles / {lote.cantidad_producida} producidas
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Cantidad neta / Unidad de Medida</Col>
                                <Col sm={7} className="fs-6">
                                    {lote.producto.cantidad_neta} - {lote.producto.unidad_medida?.nombre}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Receta utilizada</Col>
                                <Col sm={7} className="fs-6">
                                    {lote.receta ? (
                                        <div className="d-flex flex-wrap align-items-center gap-2">
                                            <span>
                                                Versión {lote.receta.version}
                                                {lote.receta.vigente
                                                    ? <span className="badge bg-success-subtle text-success-emphasis ms-2">Vigente</span>
                                                    : <span className="text-muted small ms-2">
                                                        ({formatearFechaReceta(lote.receta.fecha_desde_vigencia)} al {formatearFechaReceta(lote.receta.fecha_hasta_vigencia)})
                                                      </span>}
                                            </span>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="p-0"
                                                onClick={() => navigate(`/productos/${lote.producto_id}/receta`, { state: { recetaId: lote.receta?.id } })}
                                            >
                                                <i className="bi bi-journal-text me-1"></i>Ver receta
                                            </Button>
                                        </div>
                                    ) : (
                                        <span className="text-muted fst-italic">Sin receta registrada</span>
                                    )}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Fecha de Produccion</Col>
                                <Col sm={7} className="fs-6">{fechaProdFormateada}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Fecha de Vencimiento</Col>
                                <Col sm={7} className="fs-6">{fechaVencFormateada}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Estado Actual</Col>
                                <Col sm={7}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: estilo.bg,
                                            color: estilo.color,
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${estilo.icon} me-2`}></i>
                                        {lote.estado}
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Almacenamiento</Col>
                                <Col sm={7} className="fs-6 d-flex align-items-center gap-2">
                                    {lote.equipo ? (
                                        <Button
                                            variant="link"
                                            className="p-0 fw-semibold text-decoration-none"
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
                                        <span className="text-muted">Sin ubicacion asignada</span>
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
                                </Col>
                            </Row>

                            <Row className="mb-2 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Checklist de Supervision</Col>
                                <Col sm={7} className="fs-6 d-flex flex-wrap align-items-center gap-2">
                                    {(() => {
                                        const lista = supervisiones ?? [];
                                        const enFaseActual =
                                            lote.estado === "En produccion" || lote.estado === "Empaquetando"
                                                ? lista.filter((item) => item.fase_lote_snap === lote.estado)
                                                : lista;
                                        const totalPasos = enFaseActual.length;
                                        const completados = enFaseActual.filter((item) => item.estado === "Completada").length;
                                        if (totalPasos === 0) {
                                            return <span className="text-muted">Sin pasos registrados</span>;
                                        }
                                        const todoCompleto = completados === totalPasos;
                                        return (
                                            <>
                                                <Badge bg={todoCompleto ? "success" : "warning"} text={todoCompleto ? undefined : "dark"}>
                                                    {completados} / {totalPasos} pasos completados
                                                    {lote.estado === "En produccion" || lote.estado === "Empaquetando"
                                                        ? ` (${lote.estado})`
                                                        : ""}
                                                </Badge>
                                                {(lote.estado === "En produccion" || lote.estado === "Empaquetando") && (
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => navigate(`/checklist-supervision?lote_id=${lote.id}`)}
                                                    >
                                                        <i className="bi bi-check2-square me-1"></i>
                                                        Ir al checklist
                                                    </Button>
                                                )}
                                            </>
                                        );
                                    })()}
                                </Col>
                            </Row>

                            <hr className="my-4" />

                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">Insumos utilizados</h5>
                                {puedeAsociar && (
                                    <Button variant="outline-primary" size="sm" onClick={() => setMostrarAsociarInsumos(true)}>
                                        <i className={`bi ${insumosUtilizados.length > 0 ? "bi-pencil" : "bi-plus-circle"} me-1`}></i>
                                        {insumosUtilizados.length > 0 ? "Modificar insumos" : "Asociar insumos"}
                                    </Button>
                                )}
                            </div>

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

                            <hr className="my-4" />

                            <LineaTemporalEstadosLoteProduccion lote={lote} />

                            <hr className="my-4" />

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

                    <div className="mb-4">
                        <ListaIncidentesVinculados loteProduccionId={lote.id} />
                    </div>

                    <div className="d-flex justify-content-start gap-2 mb-4">
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
                </Col>
            </Row>

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
