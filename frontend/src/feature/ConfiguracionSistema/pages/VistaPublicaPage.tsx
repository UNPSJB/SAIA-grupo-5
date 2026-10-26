import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { QRCodeSVG } from "qrcode.react";
import { mutate } from "swr";
import { PageError } from "../../../components/PageError";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { useApi } from "../../../hooks/useApi";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import type { ConfiguracionSistema } from "../types";

const CONFIGURACION_URL = "/configuracion-sistema/";
type AjustesPublicos = Pick<ConfiguracionSistema,
    | "vista_publica_activa"
    | "vista_publica_nombre_establecimiento"
    | "vista_publica_mostrar_cumplimiento"
    | "vista_publica_mostrar_calibraciones"
    | "vista_publica_mostrar_tiempo_calibracion"
    | "vista_publica_mostrar_recambios"
    | "vista_publica_mostrar_tiempo_recambio"
    | "vista_publica_mostrar_planes_limpieza"
>;
type IndicadorToggle = {
    clave: keyof Omit<AjustesPublicos, "vista_publica_activa" | "vista_publica_nombre_establecimiento">;
    titulo: string;
    detalle: string;
};

const indicadores: IndicadorToggle[] = [
    { clave: "vista_publica_mostrar_cumplimiento", titulo: "Cumplimiento de limpieza", detalle: "Porcentaje del mes" },
    { clave: "vista_publica_mostrar_calibraciones", titulo: "Equipos con calibración al día", detalle: "Porcentaje de equipos activos" },
    { clave: "vista_publica_mostrar_tiempo_calibracion", titulo: "Tiempo promedio para calibrar", detalle: "Días desde la fecha programada hasta el registro" },
    { clave: "vista_publica_mostrar_recambios", titulo: "Elementos dentro del período de recambio", detalle: "Porcentaje de elementos activos" },
    { clave: "vista_publica_mostrar_tiempo_recambio", titulo: "Tiempo promedio para realizar el recambio", detalle: "Días desde la fecha programada hasta el registro" },
    { clave: "vista_publica_mostrar_planes_limpieza", titulo: "Planes de limpieza activos", detalle: "Cantidad de planes vigentes" },
];

export function VistaPublicaPage() {
    const { data: configuracion, error, isLoading } = useApi<ConfiguracionSistema>(CONFIGURACION_URL);
    const [nombre, setNombre] = useState("Mi establecimiento");
    const [activa, setActiva] = useState(false);
    const [seleccionados, setSeleccionados] = useState<Record<string, boolean>>({});
    const [guardando, setGuardando] = useState(false);
    const [copiado, setCopiado] = useState(false);

    useEffect(() => {
        if (!configuracion) return;
        setNombre(configuracion.vista_publica_nombre_establecimiento);
        setActiva(configuracion.vista_publica_activa);
        setSeleccionados(Object.fromEntries(indicadores.map(({ clave }) => [clave, configuracion[clave]])));
    }, [configuracion]);

    const guardar = async (cambios: Partial<AjustesPublicos>, mostrarExito = true) => {
        setGuardando(true);
        try {
            await api.put(CONFIGURACION_URL, cambios);
            await mutate(CONFIGURACION_URL);
            if (mostrarExito) mostrarAlertaExito("Cambios guardados.");
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            mostrarAlertaError(Array.isArray(detail) ? detail[0]?.msg : detail || "No se pudieron guardar los cambios.");
        } finally {
            setGuardando(false);
        }
    };

    const urlPublica = configuracion?.vista_publica_token
        ? `${window.location.origin}/publica/${configuracion.vista_publica_token}`
        : "";

    const cambiarIndicador = (clave: IndicadorToggle["clave"], valor: boolean) => {
        setSeleccionados((actual) => ({ ...actual, [clave]: valor }));
        void guardar({ [clave]: valor }, false);
    };

    if (isLoading) return <PageLoading title="Vista pública" />;
    if (error || !configuracion) return <PageError title="Vista pública" message="No se pudo cargar la configuración." />;

    return (
        <Container fluid className="pb-4">
            <PageHeader title="Vista pública" eyebrow="CONFIGURACIÓN" subtitle="Administrá el enlace y los indicadores visibles para visitantes." />
            <Row className="g-4 justify-content-center">
                <Col xs={12} xl={9}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4 p-lg-5">
                            <Row className="align-items-center g-3">
                                <Col>
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <span className={`badge rounded-pill ${activa ? "text-bg-success" : "text-bg-secondary"}`}>{activa ? "ACTIVA" : "DESACTIVADA"}</span>
                                    </div>
                                    <h2 className="h4 mb-2">Publicar indicadores</h2>
                                    <p className="text-secondary mb-0">Al activar, cualquier persona con el enlace podrá ver los indicadores que selecciones.</p>
                                </Col>
                                <Col xs="auto">
                                    <Form.Check type="switch" id="vista-publica-activa" aria-label="Activar vista pública" checked={activa} disabled={guardando} onChange={(event) => {
                                        const valor = event.target.checked;
                                        setActiva(valor);
                                        void guardar({ vista_publica_activa: valor });
                                    }} />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white border-0 px-4 pt-4 pb-0">
                            <h2 className="h5 mb-1">Contenido público</h2>
                            <p className="text-secondary mb-0">Seleccioná qué indicadores mostrar.</p>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form.Group className="mb-4" controlId="nombre-establecimiento-publico">
                                <Form.Label className="fw-semibold">Nombre del establecimiento</Form.Label>
                                <Form.Control maxLength={100} value={nombre} disabled={guardando} onChange={(event) => setNombre(event.target.value)} onBlur={() => {
                                    const nuevoNombre = nombre.trim();
                                    if (nuevoNombre && nuevoNombre !== configuracion.vista_publica_nombre_establecimiento) {
                                        setNombre(nuevoNombre);
                                        void guardar({ vista_publica_nombre_establecimiento: nuevoNombre });
                                    }
                                }} />
                            </Form.Group>
                            <Row className="g-3">
                                {indicadores.map(({ clave, titulo, detalle }) => <Col md={6} key={clave}>
                                    <Card className="h-100 bg-light border-0">
                                        <Card.Body className="d-flex align-items-center justify-content-between gap-3">
                                            <div>
                                                <h3 className="h6 mb-1">{titulo}</h3>
                                                <p className="small text-secondary mb-0">{detalle}</p>
                                            </div>
                                            <Form.Check type="switch" id={clave} aria-label={`Mostrar ${titulo}`} checked={Boolean(seleccionados[clave])} disabled={guardando} onChange={(event) => cambiarIndicador(clave, event.target.checked)} />
                                        </Card.Body>
                                    </Card>
                                </Col>)}
                            </Row>
                        </Card.Body>
                    </Card>

                    {activa && urlPublica && <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 px-4 pt-4 pb-0">
                            <h2 className="h5 mb-1">Enlace y código QR</h2>
                            <p className="text-secondary mb-0">Compartí la vista con tus clientes.</p>
                        </Card.Header>
                        <Card.Body className="p-4 d-flex flex-column flex-md-row align-items-center gap-4">
                            <div className="vista-publica-qr rounded border bg-white p-3 flex-shrink-0">
                                <QRCodeSVG value={urlPublica} size={176} level="M" includeMargin />
                            </div>
                            <div className="w-100">
                                <Form.Label className="fw-semibold">Enlace</Form.Label>
                                <div className="input-group mb-3">
                                    <Form.Control readOnly value={urlPublica} onFocus={(event) => event.target.select()} />
                                    <Button variant="outline-secondary" aria-label="Copiar enlace" onClick={() => void navigator.clipboard.writeText(urlPublica).then(() => {
                                        setCopiado(true);
                                        window.setTimeout(() => setCopiado(false), 1800);
                                    }).catch(() => mostrarAlertaError("No se pudo copiar el enlace."))}>
                                        <i className={`bi ${copiado ? "bi-check2" : "bi-copy"}`} />
                                    </Button>
                                </div>
                                <Button variant="outline-success" onClick={() => {
                                    const svg = document.querySelector<SVGSVGElement>(".vista-publica-qr svg");
                                    if (!svg) return;
                                    const archivo = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" });
                                    const descarga = URL.createObjectURL(archivo);
                                    const link = document.createElement("a");
                                    link.href = descarga;
                                    link.download = "codigo-qr-vista-publica.svg";
                                    link.click();
                                    window.setTimeout(() => URL.revokeObjectURL(descarga), 1000);
                                }}><i className="bi bi-download me-2" />Descargar QR</Button>
                                <Button variant="link" className="ms-3 px-0" href={urlPublica} target="_blank" rel="noreferrer">Abrir vista</Button>
                            </div>
                        </Card.Body>
                    </Card>}
                    {guardando && <Spinner animation="border" size="sm" className="mt-3" aria-label="Guardando" />}
                </Col>
            </Row>
        </Container>
    );
}
