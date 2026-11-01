
import { useMemo, useState } from "react";
import { Alert, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import {
    Bar, BarChart, CartesianGrid, Legend,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";

import { useApi } from "../../../hooks/useApi";
import { toDateKey } from "../../../libs/date";
import { SEAFOAM } from "../../Home/constants";
import type { Producto } from "../../Productos/types";
import type { EstadisticaProduccion as Estadistica } from "../types";

const COLORES = [
    SEAFOAM.primary,
    SEAFOAM.secondary,
    SEAFOAM.warning,
    SEAFOAM.info,
    SEAFOAM.danger,
    SEAFOAM.success
];

export function EstadisticasLotes() {
    const [fechaDesde, setFechaDesde] = useState(() => {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - 29);
        return toDateKey(fecha);
    });

    const [fechaHasta, setFechaHasta] = useState(() => toDateKey(new Date()));
    const [productoId, setProductoId] = useState("");

    const rangoValido = Boolean(
        fechaDesde && fechaHasta && fechaDesde <= fechaHasta
    );

    const params = new URLSearchParams({
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta
    });

    if (productoId) params.set("producto_id", productoId);

    const url = rangoValido
        ? `/lotes-produccion/estadisticas?${params.toString()}`
        : null;

    const {
        data: estadisticas,
        error,
        isLoading
    } = useApi<Estadistica[]>(url);

    const { data: productos, error: productosError } =
        useApi<Producto[]>("/productos/");

    const productosGraficados = useMemo(() => {
        if (!estadisticas) return [];

        const ids = new Map<number, string>();

        estadisticas.forEach((registro) => {
            ids.set(registro.producto_id, registro.producto_nombre);
        });

        return Array.from(ids, ([id, nombre]) => ({ id, nombre }));
    }, [estadisticas]);

    const datosGrafico = useMemo(() => {
        if (!estadisticas) return [];

        const fechas = new Map<string, Record<string, number | string>>();

        estadisticas.forEach((registro) => {
            const fila = fechas.get(registro.fecha) ?? {
                fecha: registro.fecha
            };

            const clave = `producto_${registro.producto_id}`;

            fila[clave] = Number(fila[clave] ?? 0) + registro.cantidad;
            fechas.set(registro.fecha, fila);
        });

        return Array.from(fechas.values())
            .sort((a, b) =>
                String(a.fecha).localeCompare(String(b.fecha))
            );
    }, [estadisticas]);

    const cantidadTotal = useMemo(() => {
        return (estadisticas ?? []).reduce(
            (total, registro) => total + registro.cantidad, 0
        );
    }, [estadisticas]);

    const formatoFecha = (fecha: string) => {
        const [anio, mes, dia] = fecha.split("-");
        void anio;
        return `${dia}/${mes}`;
    };

    return (
        <section aria-label="Estadísticas de producción" className="mb-4">
            <div className="dashboard-section-heading">
                <div>
                    <h2>Producción</h2>
                    <span>Seguimiento de cantidades producidas por producto</span>
                </div>
            </div>

            <Card className="dashboard-chart-card">
                <Card.Body>
                    <div className="dashboard-chart-heading mb-3">
                        <div>
                            <h2>Producción por producto</h2>
                            <p>Cantidad producida en el período seleccionado</p>
                        </div>
                        <span className="dashboard-chart-icon">
                            <i className="bi bi-bar-chart-line" />
                        </span>
                    </div>

                    <Row className="g-3 align-items-end mb-3">
                        <Col xs={12} md={4}>
                            <Form.Group>
                                <Form.Label>Producto</Form.Label>
                                <Form.Select
                                    value={productoId}
                                    onChange={(e) => setProductoId(e.target.value)}
                                    disabled={Boolean(productosError)}
                                >
                                    <option value="">Todos los productos</option>
                                    {(productos ?? []).map((producto) => (
                                        <option key={producto.id} value={producto.id}>
                                            {producto.nombre}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col xs={12} sm={6} md={4}>
                            <Form.Group>
                                <Form.Label>Fecha desde</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fechaDesde}
                                    max={fechaHasta || undefined}
                                    onChange={(e) => setFechaDesde(e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        <Col xs={12} sm={6} md={4}>
                            <Form.Group>
                                <Form.Label>Fecha hasta</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fechaHasta}
                                    min={fechaDesde || undefined}
                                    onChange={(e) => setFechaHasta(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {!rangoValido && (
                        <Alert variant="warning">
                            Seleccioná un rango de fechas válido.
                        </Alert>
                    )}

                    {productosError && (
                        <Alert variant="warning">
                            No se pudo cargar el listado de productos.
                        </Alert>
                    )}

                    {rangoValido && (
                        <>
                            {!error && !isLoading && (
                                <div className="mb-2 text-muted small">
                                    <strong className="text-dark">
                                        {cantidadTotal.toLocaleString("es-AR")}
                                    </strong>
                                    {" "}unidades producidas en el período
                                </div>
                            )}

                            <div className="dashboard-chart-area" style={{ height: 320 }}>
                                {isLoading ? (
                                    <div className="dashboard-chart-message">
                                        <Spinner animation="border" size="sm" />
                                        Cargando estadísticas...
                                    </div>
                                ) : error ? (
                                    <div className="dashboard-chart-message">
                                        No se pudieron cargar las estadísticas.
                                    </div>
                                ) : datosGrafico.length === 0 ? (
                                    <div className="dashboard-chart-message">
                                        No hay producción registrada en este período.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={datosGrafico}
                                            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                                            barGap={3}
                                        >
                                            <CartesianGrid stroke="#e9eef2" vertical={false} />

                                            <XAxis
                                                dataKey="fecha"
                                                tickFormatter={formatoFecha}
                                                tickLine={false}
                                                axisLine={false}
                                                minTickGap={20}
                                                tick={{ fill: "#718096", fontSize: 11 }}
                                            />

                                            <YAxis
                                                allowDecimals={false}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: "#8a969e", fontSize: 11 }}
                                            />

                                            <Tooltip
                                                labelFormatter={(label) =>
                                                    formatoFecha(String(label))
                                                }
                                                contentStyle={{
                                                    border: "1px solid #e7ecef",
                                                    borderRadius: 10
                                                }}
                                            />

                                            <Legend
                                                iconType="circle"
                                                wrapperStyle={{
                                                    fontSize: 12,
                                                    paddingTop: 12
                                                }}
                                            />

                                            {productosGraficados.map((producto, index) => (
                                                <Bar
                                                    key={producto.id}
                                                    dataKey={`producto_${producto.id}`}
                                                    name={producto.nombre}
                                                    fill={COLORES[index % COLORES.length]}
                                                    radius={[4, 4, 0, 0]}
                                                    maxBarSize={40}
                                                />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>
        </section>
    );
}
