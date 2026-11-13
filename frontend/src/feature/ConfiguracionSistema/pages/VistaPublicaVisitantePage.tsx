import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Alert, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import useSWR from "swr";
import axios from "axios";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { API_BASE_URL } from "../../../constants/api";

type IndicadorPublico = { clave: string; titulo: string; descripcion: string; valor: string; icono: string };
type DatosPublicos = {
    establecimiento: string;
    logo_pyme: string | null;
    telefono_pyme: string | null;
    email_pyme: string | null;
    direccion_pyme: string | null;
    actualizado: string;
    indicadores: IndicadorPublico[];
};


interface ItemGrafico {
    clave: string;
    nombre: string;
    nombreCorto: string;
    valor: number;
    descripcion: string;
}

const COLORES = ["#06794f", "#0fa28b", "#3ac97c", "#2f80ed", "#ebb20c", "#9d46cd"];

function parsearPorcentaje(valor: string): number | null {
    if (valor.endsWith("%")) {
        const num = parseInt(valor.slice(0, -1).trim(), 10);
        return isNaN(num) ? null : num;
    }
    return null;
}

function parsearFraccion(valor: string): { actual: number; total: number; porcentaje: number } | null {
    const partes = valor.split("/").map((p) => parseInt(p.trim(), 10));
    if (partes.length === 2 && !isNaN(partes[0]) && !isNaN(partes[1]) && partes[1] > 0) {
        return {
            actual: partes[0],
            total: partes[1],
            porcentaje: Math.round((partes[0] / partes[1]) * 100),
        };
    }
    return null;
}

function obtenerNombreCorto(clave: string, titulo: string): string {
    if (clave === "cumplimiento") return "Limpieza";
    if (clave === "calibraciones") return "Calibraciones";
    if (clave === "recambios") return "Recambios";
    if (clave === "documentos_tecnicos") return "Documentación";
    if (clave === "tareas_realizadas") return "Tareas";
    if (clave === "dias_limpieza") return "Días limpios";
    if (clave === "planes_limpieza") return "Planes";
    if (clave === "tiempo_calibracion") return "Demora calib.";
    if (clave === "tiempo_recambio") return "Demora recam.";
    return titulo.length > 16 ? `${titulo.slice(0, 14)}…` : titulo;
}

export function VistaPublicaVisitantePage() {
    const { token } = useParams<{ token: string }>();
    const { data, error, isLoading } = useSWR<DatosPublicos>(
        token ? `${API_BASE_URL}/vista-publica/${token}` : null,
        async (url: string) => (await axios.get(url, { params: { t: Date.now() } })).data,
        { revalidateOnFocus: true, revalidateOnReconnect: true },
    );

    const { datosPorcentajes, promedio } = useMemo(() => {
        if (!data?.indicadores) return { datosPorcentajes: [], promedio: null };
        const items: ItemGrafico[] = [];
        data.indicadores.forEach((ind) => {
            const pct = parsearPorcentaje(ind.valor);
            if (pct !== null) {
                items.push({
                    clave: ind.clave,
                    nombre: ind.titulo,
                    nombreCorto: obtenerNombreCorto(ind.clave, ind.titulo),
                    valor: pct,
                    descripcion: ind.descripcion,
                });
            }
        });
        const prom = items.length > 0
            ? Math.round(items.reduce((acc, curr) => acc + curr.valor, 0) / items.length)
            : null;
        return { datosPorcentajes: items, promedio: prom };
    }, [data?.indicadores]);

    return (
        <main className="min-vh-100" style={{ background: "#f4f8f6" }}>
            <Container fluid className="py-4 py-md-5 px-3 px-md-5" style={{ maxWidth: 1360 }}>
                {(!data || error || isLoading) && (
                    <header className="d-flex align-items-center gap-3 mb-5">
                        <span
                            className="rounded-3 text-white shadow-sm flex-shrink-0"
                            style={{
                                width: 44,
                                height: 44,
                                minWidth: 44,
                                minHeight: 44,
                                background: "#06794f",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <i className="bi bi-shield-check fs-4" style={{ display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }} />
                        </span>
                        <div>
                            <span className="text-success fw-semibold small text-uppercase">SAIA</span>
                            <div className="fw-bold">Indicadores de cumplimiento</div>
                        </div>
                    </header>
                )}

                {isLoading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="success" />
                        <p className="text-secondary mt-3">Cargando indicadores</p>
                    </div>
                )}

                {error && (
                    <Alert variant="light" className="border text-center py-5 shadow-sm" style={{ borderRadius: 14 }}>
                        <i className="bi bi-link-45deg fs-2 text-secondary d-block mb-2" />
                        <h1 className="h5">Vista pública no disponible</h1>
                        <p className="text-secondary mb-0">El enlace no existe o fue desactivado.</p>
                    </Alert>
                )}

                {data && !error && (
                    <>
                        <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
                            <div className="d-flex align-items-center gap-3">
                                <span
                                    className="rounded-3 text-white shadow-sm flex-shrink-0"
                                    style={{
                                        width: 44,
                                        height: 44,
                                        minWidth: 44,
                                        minHeight: 44,
                                        background: "#06794f",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <i className="bi bi-shield-check fs-4" style={{ display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }} />
                                </span>
                                <div>
                                    <span className="text-success fw-bold small text-uppercase">SAIA</span>
                                    <div className="fw-semibold text-secondary small">Portal público de buenas prácticas e inocuidad alimentaria</div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="text-secondary small bg-white px-3 py-2 rounded-3 border shadow-sm">
                                    <i className="bi bi-calendar3 me-1 text-success" />
                                    Actualizado al <strong>{data.actualizado}</strong>
                                </div>
                            </div>
                        </header>

                        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 14, background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)" }}>
                            <Card.Body className="p-4">
                                <Row className="align-items-center g-3">
                                    <Col xs={12} md={7} lg={8}>
                                        <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                                            {data.logo_pyme && (
                                                <img
                                                    src={data.logo_pyme}
                                                    alt={`Logo de ${data.establecimiento}`}
                                                    style={{
                                                        maxWidth: 160,
                                                        maxHeight: 110,
                                                        objectFit: "contain"
                                                    }}
                                                />
                                            )}

                                            <h1 className="display-6 fw-bold mb-0" style={{ color: "#1e293b" }}>
                                                {data.establecimiento}
                                            </h1>
                                        </div>

                                        {(data.telefono_pyme || data.email_pyme || data.direccion_pyme) && (
                                            <div className="d-flex flex-column gap-1 mb-3 text-secondary small">
                                                {data.telefono_pyme && (
                                                    <div>
                                                        <i className="bi bi-telephone me-2" />
                                                        {data.telefono_pyme}
                                                    </div>
                                                )}

                                                {data.email_pyme && (
                                                    <div>
                                                        <i className="bi bi-envelope me-2" />
                                                        {data.email_pyme}
                                                    </div>
                                                )}

                                                {data.direccion_pyme && (
                                                    <div>
                                                        <i className="bi bi-geo-alt me-2" />
                                                        {data.direccion_pyme}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <p className="text-secondary mb-0">
                                            Indicadores de gestión de calidad , buenas prácticas e inocuidad alimentaria
                                        </p>
                                    </Col>
                                    <Col xs={12} md={5} lg={4}>
                                        <div className="d-flex gap-3 justify-content-md-end">
                                            <div className="bg-white p-3 rounded-3 shadow-sm border text-center flex-fill" style={{ maxWidth: 170 }}>
                                                <div className="text-secondary small fw-semibold text-uppercase">Indicadores</div>
                                                <div className="fs-3 fw-bold" style={{ color: "#06794f" }}>{data.indicadores.length}</div>
                                                <div className="text-muted" style={{ fontSize: "0.75rem" }}>monitoreados</div>
                                            </div>
                                            {promedio !== null && (
                                                <div className="bg-white p-3 rounded-3 shadow-sm border text-center flex-fill" style={{ maxWidth: 170 }}>
                                                    <div className="text-secondary small fw-semibold text-uppercase">Cumplimiento</div>
                                                    <div className="fs-3 fw-bold" style={{ color: "#06794f" }}>{promedio}%</div>
                                                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>promedio global</div>
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {datosPorcentajes.length > 0 && (
                            <section className="mb-4">
                                <Row className="g-3">
                                    <Col xs={12} lg={7} xl={8}>
                                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 14 }}>
                                            <Card.Body className="p-4">
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <div>
                                                        <h2 className="h6 fw-bold mb-1" style={{ color: "#1e293b" }}>Índices de cumplimiento y vigencia</h2>
                                                        <p className="text-secondary small mb-0">Nivel porcentual alcanzado en cada eje de control</p>
                                                    </div>
                                                    <span
                                                        className="rounded-2 flex-shrink-0"
                                                        style={{
                                                            width: 34,
                                                            height: 34,
                                                            minWidth: 34,
                                                            minHeight: 34,
                                                            background: "#e8f6f0",
                                                            color: "#06794f",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        <i className="bi bi-bar-chart-line fs-5" style={{ display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }} />
                                                    </span>
                                                </div>
                                                <div style={{ width: "100%", height: 260 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart
                                                            layout="vertical"
                                                            data={datosPorcentajes}
                                                            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                                                            barCategoryGap="20%"
                                                        >
                                                            <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                                                            <XAxis
                                                                type="number"
                                                                domain={[0, 100]}
                                                                ticks={[0, 25, 50, 75, 100]}
                                                                tickFormatter={(v) => `${v}%`}
                                                                tick={{ fill: "#64748b", fontSize: 12 }}
                                                                axisLine={false}
                                                                tickLine={false}
                                                            />
                                                            <YAxis
                                                                type="category"
                                                                dataKey="nombreCorto"
                                                                tick={{ fill: "#334155", fontSize: 12, fontWeight: 500 }}
                                                                width={120}
                                                                axisLine={false}
                                                                tickLine={false}
                                                            />
                                                            <Tooltip
                                                                contentStyle={{
                                                                    borderRadius: 8,
                                                                    border: "1px solid #e2e8f0",
                                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                                                                    fontSize: 13,
                                                                }}
                                                                formatter={(val: any) => [`${val}%`, "Cumplimiento"]}
                                                                labelFormatter={(_label, items) => items[0]?.payload?.nombre || _label}
                                                            />
                                                            <Bar dataKey="valor" radius={[0, 6, 6, 0]} maxBarSize={28}>
                                                                {datosPorcentajes.map((_, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col xs={12} lg={5} xl={4}>
                                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: 14 }}>
                                            <Card.Body className="p-4 d-flex flex-column">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <div>
                                                        <h2 className="h6 fw-bold mb-1" style={{ color: "#1e293b" }}>Balance de indicadores</h2>
                                                        <p className="text-secondary small mb-0">Distribución de metas cumplidas</p>
                                                    </div>
                                                    <span
                                                        className="rounded-2 flex-shrink-0"
                                                        style={{
                                                            width: 34,
                                                            height: 34,
                                                            minWidth: 34,
                                                            minHeight: 34,
                                                            background: "#e8f6f0",
                                                            color: "#06794f",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        <i className="bi bi-pie-chart fs-5" style={{ display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }} />
                                                    </span>
                                                </div>
                                                <div className="position-relative flex-fill d-flex align-items-center justify-content-center" style={{ minHeight: 200 }}>
                                                    <ResponsiveContainer width="100%" height={200}>
                                                        <PieChart>
                                                            <Pie
                                                                data={datosPorcentajes}
                                                                dataKey="valor"
                                                                nameKey="nombreCorto"
                                                                innerRadius={55}
                                                                outerRadius={78}
                                                                paddingAngle={3}
                                                            >
                                                                {datosPorcentajes.map((_, index) => (
                                                                    <Cell key={`donut-${index}`} fill={COLORES[index % COLORES.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip
                                                                content={({ active, payload }) => {
                                                                    if (!active || !payload || !payload.length) return null;
                                                                    const item = payload[0].payload;
                                                                    return (
                                                                        <div className="bg-white px-3 py-2 rounded-3 shadow-sm border" style={{ fontSize: 12, maxWidth: 220 }}>
                                                                            <div className="fw-semibold text-dark">{item.nombre}</div>
                                                                            <div className="text-secondary small">{item.descripcion}</div>
                                                                        </div>
                                                                    );
                                                                }}
                                                            />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                    <div className="position-absolute text-center" style={{ pointerEvents: "none" }}>
                                                        <div className="fs-3 fw-bold" style={{ color: "#06794f", lineHeight: 1.1 }}>{promedio}%</div>
                                                        <span className="text-secondary" style={{ fontSize: "0.72rem" }}>Promedio</span>
                                                    </div>
                                                </div>
                                                <div className="d-flex flex-wrap justify-content-center gap-2 pt-2 border-top">
                                                    {datosPorcentajes.map((item, idx) => (
                                                        <span key={item.clave} className="small d-flex align-items-center gap-1 text-secondary" style={{ fontSize: "0.75rem" }}>
                                                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORES[idx % COLORES.length], display: "inline-block" }} />
                                                            {item.nombreCorto}: <strong className="text-dark">{item.valor}%</strong>
                                                        </span>
                                                    ))}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </section>
                        )}

                        {data.indicadores.length > 0 && (
                            <section>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div>
                                        <h2 className="h5 fw-bold mb-1" style={{ color: "#1e293b" }}>Detalle de indicadores certificados</h2>
                                        <p className="text-secondary small mb-0">Métricas consolidadas del establecimiento</p>
                                    </div>
                                </div>
                                <Row className="g-3">
                                    {data.indicadores.map((indicador) => {
                                        const pct = parsearPorcentaje(indicador.valor);
                                        const fraccion = parsearFraccion(indicador.valor);
                                        const barraProgreso = pct !== null ? pct : fraccion !== null ? fraccion.porcentaje : null;

                                        return (
                                            <Col xs={12} sm={6} lg={4} key={indicador.clave}>
                                                <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: 12 }}>
                                                    <Card.Body className="p-4 d-flex flex-column justify-content-between">
                                                        <div>
                                                            <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                                                                <span
                                                                    className="rounded-3 flex-shrink-0"
                                                                    style={{
                                                                        width: 44,
                                                                        height: 44,
                                                                        minWidth: 44,
                                                                        minHeight: 44,
                                                                        background: "#e7f5ee",
                                                                        color: "#06794f",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                    }}
                                                                >
                                                                    <i className={`bi ${indicador.icono} fs-5`} style={{ display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }} />
                                                                </span>
                                                                <div className="display-6 fw-bold text-end" style={{ color: "#06794f", lineHeight: 1.1 }}>
                                                                    {indicador.valor}
                                                                </div>
                                                            </div>
                                                            <h3 className="h6 fw-bold mb-1" style={{ color: "#1e293b" }}>{indicador.titulo}</h3>
                                                            <p className="text-secondary small mb-3">{indicador.descripcion}</p>
                                                        </div>
                                                        {barraProgreso !== null && (
                                                            <div className="progress" style={{ height: 6, backgroundColor: "#e2e8f0", borderRadius: 4 }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    role="progressbar"
                                                                    style={{ width: `${Math.min(100, Math.max(0, barraProgreso))}%`, backgroundColor: "#06794f", borderRadius: 4 }}
                                                                    aria-valuenow={barraProgreso}
                                                                    aria-valuemin={0}
                                                                    aria-valuemax={100}
                                                                />
                                                            </div>
                                                        )}
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </section>
                        )}
                    </>
                )}
            </Container>
        </main>
    );
}
