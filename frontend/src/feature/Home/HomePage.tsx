import { useMemo } from "react";
import { Alert, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import type { ElementoLimpieza } from "../ElementosLimpieza/types";
import type { TareaOcurrencia } from "../TareasOcurrencias/types";
import type { VencimientoPersonal } from "../VencimientoPersonal/types";
import type { ConfiguracionSistema } from "../ConfiguracionSistema/types";
import { getEstadoHistorial } from "../Historial/types";
import "./HomePage.css";

const SEAFOAM = {
    primary: "#06794f",
    secondary: "#0fa28b",
    success: "#3ac97c",
    danger: "#d73f30",
    warning: "#ebb20c",
    info: "#9d46cd",
};

function toDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function dateFromKey(key: string) {
    return new Date(`${key}T00:00:00`);
}

function MetricCard({
    label,
    value,
    icon,
    tone,
    detail,
    to,
}: {
    label: string;
    value: number | string;
    icon: string;
    tone: string;
    detail?: string;
    to?: string;
}) {
    const navigate = useNavigate();
    const clickable = Boolean(to);

    return (
        <Card
            className={`dashboard-metric h-100${clickable ? " dashboard-metric-clickable" : ""}`}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={clickable ? () => navigate(to!) : undefined}
            onKeyDown={clickable ? (event) => { if (event.key === "Enter") navigate(to!); } : undefined}
        >
            <Card.Body>
                <div className="d-flex align-items-start justify-content-between gap-2">
                    <div>
                        <div className="dashboard-metric-label">{label}</div>
                        <div className="dashboard-metric-value">{value}</div>
                    </div>
                    <span className="dashboard-metric-icon" style={{ color: tone, backgroundColor: `${tone}18` }}>
                        <i className={`bi ${icon}`} aria-hidden="true" />
                    </span>
                </div>
                {detail && <div className="dashboard-metric-detail">{detail}</div>}
            </Card.Body>
        </Card>
    );
}

export function HomePage() {
    const { currentUser } = useAuth();
    const today = useMemo(() => new Date(), []);
    const fromDate = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() - 29);
        return date;
    }, []);
    const historyUrl = `/tareas-ocurrencia/historial?fecha_desde=${toDateKey(fromDate)}&fecha_hasta=${toDateKey(today)}`;

    const { data: history, error: historyError, isLoading: historyLoading } = useApi<TareaOcurrencia[]>(historyUrl);
    const { data: elements, error: elementsError, isLoading: elementsLoading } = useApi<ElementoLimpieza[]>("/elementos-limpieza/");
    const { data: vencimientosPersonal, error: vencimientosPersonalError, isLoading: vencimientosPersonalLoading } = useApi<VencimientoPersonal[]>(
        currentUser?.administrar ? "/vencimiento-personal/" : null,
    );
    const { data: configuracion } = useApi<ConfiguracionSistema>(
        currentUser?.administrar ? "/configuracion-sistema/" : null,
    );

    const occurrences = useMemo(() => history ?? [], [history]);
    const activeElements = (elements ?? []).filter((element) => element.estado);
    const overdueElements = activeElements.filter((element) => element.dias_restantes !== null && element.dias_restantes < 0);
    const dueSoonElements = activeElements.filter((element) => element.dias_restantes !== null && element.dias_restantes >= 0 && element.dias_restantes <= 7);
    const diasAntelacionVencimiento = configuracion?.dias_antelacion_vencimiento ?? 15;
    const vencimientosPersonalVencidos = (vencimientosPersonal ?? []).filter((vencimiento) => vencimiento.dias_restantes <= 0);
    const vencimientosPersonalProximos = (vencimientosPersonal ?? []).filter((vencimiento) => vencimiento.dias_restantes > 0 && vencimiento.dias_restantes <= diasAntelacionVencimiento);

    const { completed, overdueTasks, pendingTasks, compliance, activityByDay } = useMemo(() => {
        const completedTasks = occurrences.filter((occurrence) => occurrence.estado === "Completada").length;
        const failedTasks = occurrences.filter((occurrence) => getEstadoHistorial(occurrence) === "Incumplida").length;
        const pending = occurrences.length - completedTasks - failedTasks;
        const resolved = completedTasks + failedTasks;
        const daily = new Map<string, { date: string; completed: number; overdue: number; pending: number }>();

        for (let offset = 6; offset >= 0; offset -= 1) {
            const date = new Date(today);
            date.setDate(date.getDate() - offset);
            const key = toDateKey(date);
            daily.set(key, { date: key, completed: 0, overdue: 0, pending: 0 });
        }

        occurrences.forEach((occurrence) => {
            const item = daily.get(occurrence.fecha.slice(0, 10));
            if (!item) return;
            const state = getEstadoHistorial(occurrence);
            if (state === "Completada") item.completed += 1;
            else if (state === "Incumplida") item.overdue += 1;
            else item.pending += 1;
        });

        return {
            completed: completedTasks,
            overdueTasks: failedTasks,
            pendingTasks: pending,
            compliance: resolved > 0 ? Math.round((completedTasks / resolved) * 100) : null,
            activityByDay: Array.from(daily.values()).map((day) => ({
                ...day,
                label: new Intl.DateTimeFormat("es-AR", { weekday: "short" }).format(dateFromKey(day.date)),
            })),
        };
    }, [occurrences, today]);

    const replacementStatus = useMemo(() => {
        const withoutSchedule = activeElements.filter((element) => element.dias_restantes === null).length;
        const onTrack = activeElements.length - overdueElements.length - dueSoonElements.length - withoutSchedule;
        return [
            { name: "Al día", value: onTrack, color: SEAFOAM.primary },
            { name: "Por vencer · 7 días", value: dueSoonElements.length, color: SEAFOAM.warning },
            { name: "Vencidos", value: overdueElements.length, color: SEAFOAM.danger },
            { name: "Sin frecuencia", value: withoutSchedule, color: "#a7b1ba" },
        ].filter((item) => item.value > 0);
    }, [activeElements, dueSoonElements.length, overdueElements.length]);

    const historyHasError = Boolean(historyError);
    const inventoryHasError = Boolean(elementsError);
    const formatMetric = (loading: boolean, error: boolean, value: number | string) =>
        loading ? "…" : error ? "—" : value;

    return (
        <Container fluid className="dashboard-page">
            <div className="dashboard-heading">
                <div>
                    <span className="dashboard-eyebrow">PANEL DE CONTROL</span>
                    <h1>Resumen operativo</h1>
                    <p>Actividad de checklists e indicadores de limpieza de los últimos 30 días.</p>
                </div>
                <span className="dashboard-period"><i className="bi bi-calendar3 me-2" />Últimos 30 días</span>
            </div>

            {(historyHasError || inventoryHasError) && (
                <Alert variant="warning" className="dashboard-alert">
                    No se pudieron cargar algunos indicadores. Los datos disponibles siguen visibles.
                </Alert>
            )}

            <section aria-label="Indicadores de checklists" className="mb-4">
                <div className="dashboard-section-heading">
                    <div><h2>Checklists</h2><span>Seguimiento de tareas programadas</span></div>
                    {historyLoading && <Spinner animation="border" size="sm" variant="success" aria-label="Cargando historial" />}
                </div>
                <Row className="g-3">
                    <Col xs={6} xl={3}><MetricCard label="Total de tareas" value={formatMetric(historyLoading, historyHasError, occurrences.length)} icon="bi-list-task" tone={SEAFOAM.primary} detail="En el período seleccionado" /></Col>
                    <Col xs={6} xl={3}><MetricCard label="Completadas" value={formatMetric(historyLoading, historyHasError, completed)} icon="bi-check2-circle" tone={SEAFOAM.success} detail="Registradas correctamente" /></Col>
                    <Col xs={6} xl={3}><MetricCard label="Incumplidas" value={formatMetric(historyLoading, historyHasError, overdueTasks)} icon="bi-exclamation-circle" tone={SEAFOAM.danger} detail={`${pendingTasks} pendientes`} /></Col>
                    <Col xs={6} xl={3}><MetricCard label="Cumplimiento" value={historyLoading ? "…" : historyHasError || compliance === null ? "—" : `${compliance}%`} icon="bi-speedometer2" tone={SEAFOAM.secondary} detail="Sobre tareas resueltas" /></Col>
                </Row>
            </section>

            <section aria-label="Indicadores de inventario" className="mb-4">
                <div className="dashboard-section-heading">
                    <div><h2>Inventario, recambios y vencimientos</h2><span>Elementos activos, fechas de recambio y vencimientos de personal</span></div>
                    {(elementsLoading || vencimientosPersonalLoading) && <Spinner animation="border" size="sm" variant="success" aria-label="Cargando inventario" />}
                </div>
                <Row className="g-3">
                    <Col xs={6} md={4} xl={3}><MetricCard label="Elementos vencidos" value={formatMetric(elementsLoading, Boolean(elementsError), overdueElements.length)} icon="bi-calendar-x" tone={SEAFOAM.danger} detail="Requieren recambio" to="/elementos-limpieza?estado=vencido" /></Col>
                    <Col xs={6} md={4} xl={3}><MetricCard label="Elementos Por vencer" value={formatMetric(elementsLoading, Boolean(elementsError), dueSoonElements.length)} icon="bi-calendar2-week" tone={SEAFOAM.warning} detail="Dentro de los próximos 7 días" to="/elementos-limpieza?estado=por-vencer" /></Col>
                    <Col xs={6} md={4} xl={3}>
                        <MetricCard
                            label="Personal vencidos"
                            value={currentUser?.administrar ? formatMetric(vencimientosPersonalLoading, Boolean(vencimientosPersonalError), vencimientosPersonalVencidos.length) : "—"}
                            icon="bi-person-x"
                            tone={SEAFOAM.danger}
                            detail={currentUser?.administrar ? "Vencimientos de personal" : "Solo administración"}
                            to={currentUser?.administrar ? "/personal?vencimientos=vencido" : undefined}
                        />
                    </Col>
                    <Col xs={6} md={4} xl={3}>
                        <MetricCard
                            label="Personal por vencer"
                            value={currentUser?.administrar ? formatMetric(vencimientosPersonalLoading, Boolean(vencimientosPersonalError), vencimientosPersonalProximos.length) : "—"}
                            icon="bi-person-exclamation"
                            tone={SEAFOAM.warning}
                            detail={currentUser?.administrar ? "Dentro de la antelación configurada" : "Solo administración"}
                            to={currentUser?.administrar ? "/personal?vencimientos=proximo" : undefined}
                        />
                    </Col>
                </Row>
            </section>

            <Row className="g-3 dashboard-charts">
                <Col xl={7}>
                    <Card className="dashboard-chart-card h-100">
                        <Card.Body>
                            <div className="dashboard-chart-heading">
                                <div><h2>Actividad de tareas</h2><p>Resultado diario de los últimos 7 días</p></div>
                                <span className="dashboard-chart-icon"><i className="bi bi-bar-chart-line" /></span>
                            </div>
                            <div className="dashboard-chart-area" role="img" aria-label="Gráfico de tareas completadas, incumplidas y pendientes por día">
                                {historyLoading ? <div className="dashboard-chart-message"><Spinner animation="border" size="sm" /> Cargando actividad…</div> : historyHasError ? <div className="dashboard-chart-message">No se pudo cargar la actividad.</div> : occurrences.length === 0 ? <div className="dashboard-chart-message">Todavía no hay tareas en este período.</div> : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={activityByDay} margin={{ top: 10, right: 10, left: -18, bottom: 0 }} barGap={4}>
                                            <CartesianGrid stroke="#e9eef2" vertical={false} />
                                            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#718096", fontSize: 12 }} />
                                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#8a969e", fontSize: 11 }} />
                                            <Tooltip contentStyle={{ border: "1px solid #e7ecef", borderRadius: 10, boxShadow: "0 8px 24px rgba(35, 50, 60, .12)" }} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                                            <Bar dataKey="completed" name="Completadas" fill={SEAFOAM.primary} radius={[5, 5, 0, 0]} maxBarSize={25} />
                                            <Bar dataKey="overdue" name="Incumplidas" fill={SEAFOAM.danger} radius={[5, 5, 0, 0]} maxBarSize={25} />
                                            <Bar dataKey="pending" name="Pendientes" fill={SEAFOAM.warning} radius={[5, 5, 0, 0]} maxBarSize={25} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xl={5}>
                    <Card className="dashboard-chart-card h-100">
                        <Card.Body>
                            <div className="dashboard-chart-heading">
                                <div><h2>Estado de recambios</h2><p>Estado de los elementos activos</p></div>
                                <span className="dashboard-chart-icon"><i className="bi bi-arrow-repeat" /></span>
                            </div>
                            <div className="dashboard-donut-area" role="img" aria-label="Distribución de elementos al día, por vencer, vencidos y sin frecuencia">
                                {elementsLoading ? <div className="dashboard-chart-message"><Spinner animation="border" size="sm" /> Cargando recambios…</div> : elementsError ? <div className="dashboard-chart-message">No se pudo cargar el estado de recambios.</div> : activeElements.length === 0 ? <div className="dashboard-chart-message">No hay elementos activos para mostrar.</div> : (
                                    <>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={replacementStatus} dataKey="value" nameKey="name" innerRadius={64} outerRadius={91} paddingAngle={3} stroke="none">
                                                    {replacementStatus.map((item) => <Cell key={item.name} fill={item.color} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ border: "1px solid #e7ecef", borderRadius: 10, boxShadow: "0 8px 24px rgba(35, 50, 60, .12)" }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="dashboard-donut-center"><strong>{activeElements.length}</strong><span>activos</span></div>
                                    </>
                                )}
                            </div>
                            <div className="dashboard-chart-legend">
                                {replacementStatus.map((item) => (
                                    <span key={item.name}><i style={{ backgroundColor: item.color }} />{item.name}<strong>{item.value}</strong></span>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

        </Container>
    );
}
