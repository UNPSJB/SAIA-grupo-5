
import { useState } from "react";
import { mutate } from "swr";
import { Container, Alert, Row, Col, Card, Button, Table, Badge } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";
import type { LoteProduccion, EstadoLote } from "../types";
import { PageLoading } from "../../../components/PageLoading";
import { AsociarInsumosModal } from "../components/AsociarInsumosModal";
import type { EnvioLote } from "../../EnviosLote/types";
import { CrearEnvioModal } from "../../EnviosLote/components/CrearEnvioLoteModal";
import { RecepcionEnvioModal } from "../../EnviosLote/components/RecepcionEnvioLoteModal";
import { VerEnvioLoteModal } from "../../EnviosLote/components/VerEnvioLoteModal";
import { ActionButton } from "../../../components/ActionButton";

const ESTILOS_ESTADO: Record<EstadoLote, { bg: string; color: string; icon: string }> = {
    "En produccion": { bg: "#fef9c3", color: "#854d0e", icon: "bi-gear-wide-connected" },
    "Empaquetando": { bg: "#dbeafe", color: "#1e40af", icon: "bi-box-seam" },
    "Terminado": { bg: "#dcfce7", color: "#166534", icon: "bi-check2-circle" },
    "Parcialmente despachado": { bg: "#e0e7ff", color: "#3730a3", icon: "bi-truck" },
    "Enviado": { bg: "#f3f4f6", color: "#374151", icon: "bi-truck" },
};

const BADGES_ENVIO: Record<string, string> = {
    "En camino": "warning",
    "Entregado": "success",
    "Rechazado": "danger",
};

export function VerLoteProduccionPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [mostrarAsociarInsumos, setMostrarAsociarInsumos] = useState(false);
    const [mostrarCrearEnvio, setMostrarCrearEnvio] = useState(false);
    const [envioParaRecepcion, setEnvioParaRecepcion] = useState<EnvioLote | null>(null);
    const [envioParaDetalle, setEnvioParaDetalle] = useState<EnvioLote | null>(null);

    const { data: envios } = useApi<EnvioLote[]>(id ? `/envios-lote/lote/${id}` : null);
    const { data: lote, isLoading, error } = useApi<LoteProduccion>(`/lotes-produccion/${id}`);

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
        setMostrarAsociarInsumos(false);
    };

    const handleEnvioActualizado = () => {
    mutate(`/lotes-produccion/${id}`);
    mutate(`/envios-lote/lote/${id}`);
};

    return (
        <Container>
            <PageHeader title={tituloPagina} />

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
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
                                <Col sm={5} className="fw-bold text-secondary">Fecha de Produccion</Col>
                                <Col sm={7} className="fs-6">{fechaProdFormateada}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Fecha de Vencimiento</Col>
                                <Col sm={7} className="fs-6">{fechaVencFormateada}</Col>
                            </Row>

                            <Row className="mb-2 align-items-center">
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
                                <Table responsive bordered hover size="sm" className="mb-0">
                                    <thead>
                                        <tr>
                                            <th>Insumo</th>
                                            <th>Cantidad utilizada</th>
                                            <th>Unidad de medida</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {insumosUtilizados.map((registro) => (
                                            <tr key={registro.id}>
                                                <td>{registro.insumo.nombre}</td>
                                                <td>{Number(registro.cantidad_utilizada).toLocaleString("es-AR", { maximumFractionDigits: 3 })}</td>
                                                <td>{registro.insumo.unidad_medida.nombre}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}

                            <hr className="my-4" />

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="mb-0">Despachos y Envios del Lote</h5>
                                    {puedeDespachar && (
                                        <Button variant="outline-success" size="sm" onClick={() => setMostrarCrearEnvio(true)}>
                                            <i className="bi bi-truck me-1"></i>Nuevo Envío
                                        </Button>
                                    )}
                                </div>

                                {(!envios || envios.length === 0) ? (
                                    <p className="text-muted mb-0">No se registran envios para este lote de producción.</p>
                                ) : (
                                    <Table responsive bordered hover size="sm" className="mb-0">
                                        <thead>
                                            <tr>
                                                <th>Remito</th>
                                                <th>Cliente</th>
                                                <th>Cantidad</th>
                                                <th>Fecha Envio</th>
                                                <th>Estado</th>
                                                <th className="text-center">Accion</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {envios.map((env) => (
                                                <tr key={env.id}>
                                                    <td><strong>{env.numero_remito}</strong></td>
                                                    <td>{env.cliente.razon_social}</td>
                                                    <td>{env.cantidad}</td>
                                                    <td>{env.fecha_envio.split("-").reverse().join("/")}</td>
                                                    <td>
                                                        <Badge bg={BADGES_ENVIO[env.estado] || "secondary"}>
                                                            {env.estado}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                                                            <ActionButton
                                                                variant="outline-info"
                                                                size="sm"
                                                                tooltip="Ver detalle"
                                                                icon="bi bi-eye"
                                                                onClick={() => setEnvioParaDetalle(env)}
                                                            />
                                                            {currentUser?.operar && env.estado === "En camino" && (
                                                                <ActionButton
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    tooltip="Registrar recepcion"
                                                                    icon="bi bi-check2-circle"
                                                                    onClick={() => setEnvioParaRecepcion(env)}
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-start gap-2">
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
                        </Card.Footer>
                    </Card>
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
        </Container>
    );
}
