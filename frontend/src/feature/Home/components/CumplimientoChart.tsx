import { useMemo, useState } from "react";
import { ButtonGroup, Card, Form, Spinner, ToggleButton } from "react-bootstrap";
import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useApi } from "../../../hooks/useApi";
import type { TareaOcurrencia } from "../../TareasOcurrencias/types";
import { getEstadoHistorial } from "../../Historial/types";
import { toDateKey, dateFromKey } from "../../../libs/date";
import { SEAFOAM } from "../constants";

type Agrupacion = "dia" | "semana";

interface PuntoCumplimiento {
    key: string;
    label: string;
    cumplimiento: number | null;
    completadas: number;
    incumplidas: number;
    pendientes: number;
}

// Lunes de la semana a la que pertenece la fecha
function inicioSemana(date: Date) {
    const inicio = new Date(date);
    const dia = (inicio.getDay() + 6) % 7;
    inicio.setDate(inicio.getDate() - dia);
    return inicio;
}

const formatoDia = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit" });

export function CumplimientoChart() {
    const [fechaHasta, setFechaHasta] = useState(() => toDateKey(new Date()));
    const [fechaDesde, setFechaDesde] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 29);
        return toDateKey(date);
    });
    const [agrupacion, setAgrupacion] = useState<Agrupacion>("dia");

    const rangoValido = Boolean(fechaDesde) && Boolean(fechaHasta) && fechaDesde <= fechaHasta;
    const { data, error, isLoading } = useApi<TareaOcurrencia[]>(
        rangoValido ? `/tareas-ocurrencia/historial?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}` : null,
    );

    const puntos = useMemo<PuntoCumplimiento[]>(() => {
        if (!rangoValido) return [];
        const buckets = new Map<string, PuntoCumplimiento>();
        const keyDe = (date: Date) => toDateKey(agrupacion === "semana" ? inicioSemana(date) : date);

        // Se generan todos los períodos del rango para que los días/semanas sin datos queden visibles
        const cursor = dateFromKey(fechaDesde);
        const fin = dateFromKey(fechaHasta);
        while (cursor <= fin) {
            const key = keyDe(cursor);
            if (!buckets.has(key)) {
                const label = agrupacion === "semana"
                    ? `Sem. ${formatoDia.format(dateFromKey(key))}`
                    : formatoDia.format(cursor);
                buckets.set(key, { key, label, cumplimiento: null, completadas: 0, incumplidas: 0, pendientes: 0 });
            }
            cursor.setDate(cursor.getDate() + 1);
        }

        (data ?? []).forEach((ocurrencia) => {
            const item = buckets.get(keyDe(dateFromKey(ocurrencia.fecha.slice(0, 10))));
            if (!item) return;
            const estado = getEstadoHistorial(ocurrencia);
            if (estado === "Completada") item.completadas += 1;
            else if (estado === "Incumplida") item.incumplidas += 1;
            else item.pendientes += 1;
        });

        // El cumplimiento se calcula sobre tareas resueltas, igual que el indicador general
        return Array.from(buckets.values()).map((item) => {
            const resueltas = item.completadas + item.incumplidas;
            return { ...item, cumplimiento: resueltas > 0 ? Math.round((item.completadas / resueltas) * 100) : null };
        });
    }, [data, agrupacion, fechaDesde, fechaHasta, rangoValido]);

    const hayDatos = puntos.some((punto) => punto.cumplimiento !== null);

    return (
        <Card className="dashboard-chart-card h-100">
            <Card.Body>
                <div className="dashboard-chart-heading">
                    <div>
                        <h2>Cumplimiento de checklists</h2>
                        <p>Porcentaje de tareas completadas sobre resueltas por {agrupacion === "dia" ? "día" : "semana"}</p>
                    </div>
                    <span className="dashboard-chart-icon">
                        <i className="bi bi-graph-up" />
                    </span>
                </div>

                <div className="dashboard-chart-filters">
                    <Form.Group controlId="cumplimiento-desde">
                        <Form.Label>Desde</Form.Label>
                        <Form.Control
                            type="date"
                            size="sm"
                            value={fechaDesde}
                            max={fechaHasta}
                            onChange={(e) => setFechaDesde(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="cumplimiento-hasta">
                        <Form.Label>Hasta</Form.Label>
                        <Form.Control
                            type="date"
                            size="sm"
                            value={fechaHasta}
                            min={fechaDesde}
                            onChange={(e) => setFechaHasta(e.target.value)}
                        />
                    </Form.Group>
                    <ButtonGroup size="sm" aria-label="Agrupar por" className="ms-auto">
                        {([["dia", "Por día"], ["semana", "Por semana"]] as const).map(([value, label]) => (
                            <ToggleButton
                                key={value}
                                id={`cumplimiento-agrupacion-${value}`}
                                type="radio"
                                variant="outline-success"
                                name="cumplimiento-agrupacion"
                                value={value}
                                checked={agrupacion === value}
                                onChange={() => setAgrupacion(value)}
                            >
                                {label}
                            </ToggleButton>
                        ))}
                    </ButtonGroup>
                </div>

                <div className="dashboard-chart-area"
                    role="img"
                    aria-label={`Gráfico de porcentaje de cumplimiento de checklists por ${agrupacion === "dia" ? "día" : "semana"}`}
                >
                    {!rangoValido ?
                        <div className="dashboard-chart-message">
                            Seleccioná un rango de fechas válido.
                        </div> : isLoading ?
                            <div className="dashboard-chart-message">
                                <Spinner animation="border" size="sm" />
                                Cargando cumplimiento…
                            </div> : error ?
                                <div className="dashboard-chart-message">
                                    No se pudo cargar el cumplimiento.
                                </div> : !hayDatos ?
                                    <div className="dashboard-chart-message">
                                        No hay tareas resueltas en este período.
                                    </div> : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={puntos} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                                                <CartesianGrid stroke="#e9eef2" vertical={false} />
                                                <XAxis
                                                    dataKey="label"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    minTickGap={12}
                                                    tick={{ fill: "#718096", fontSize: 12 }}
                                                />
                                                <YAxis
                                                    domain={[0, 100]}
                                                    ticks={[0, 25, 50, 75, 100]}
                                                    tickFormatter={(value) => `${value}%`}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tick={{ fill: "#8a969e", fontSize: 11 }}
                                                />
                                                <ReferenceLine y={100} stroke="#e9eef2" />
                                                <Tooltip
                                                    contentStyle={{
                                                        border: "1px solid #e7ecef",
                                                        borderRadius: 10,
                                                        boxShadow: "0 8px 24px rgba(35, 50, 60, .12)"
                                                    }}
                                                    formatter={(value, _name, { payload }) => [
                                                        value === null || value === undefined
                                                            ? "Sin tareas resueltas"
                                                            : `${value}% (${payload.completadas} de ${payload.completadas + payload.incumplidas})`,
                                                        "Cumplimiento",
                                                    ]}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="cumplimiento"
                                                    name="Cumplimiento"
                                                    stroke={SEAFOAM.primary}
                                                    strokeWidth={2}
                                                    dot={{ r: 3, fill: SEAFOAM.primary, strokeWidth: 0 }}
                                                    activeDot={{ r: 5 }}
                                                    connectNulls
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                </div>
            </Card.Body>
        </Card>
    );
}
