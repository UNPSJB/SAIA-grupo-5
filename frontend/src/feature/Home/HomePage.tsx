import { useMemo, useRef } from "react";
import { Alert, Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import {Bar,BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import { useApi } from "../../hooks/useApi";
import type { ElementoLimpieza } from "../ElementosLimpieza/types";
import type { TareaOcurrencia } from "../TareasOcurrencias/types";
import { calcularEstadoVencimientos, type VencimientoPersonal } from "../VencimientoPersonal/types";
import type { ConfiguracionSistema } from "../ConfiguracionSistema/types";
import type { PlanCalibracion } from "../PlanesCalibracion/types";
import type { IncidenteSeguimiento } from "../Incidentes/types";
import { getEstadoHistorial } from "../Historial/types";
import { EstadisticasLotes } from "../EstadisticasProduccion/components/EstadisticaLote";
import { clasificarPorDiasRestantes } from "../VencimientosConsolidados/utils/estado";
import { toDateKey, dateFromKey } from "../../libs/date";
import { MetricCard } from "./components/MetricCard";
import { CumplimientoChart } from "./components/CumplimientoChart";
import { ExportarGraficoButton } from "./components/ExportarGraficoButton";
import { SEAFOAM } from "./constants";
import "./HomePage.css";
import { useAuth } from "../../hooks";
import { useNavigate } from 'react-router-dom';

export function HomePage() {
    const { currentUser } = useAuth();
    return currentUser?.administrar ? <VistaAdmin /> : <VistaOperador />;
}

function VistaOperador() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const nombre = currentUser?.nombre || "Operador";

    const { data: checklistHoy } = useApi<TareaOcurrencia[]>("/tareas-ocurrencia/");
    const { data: recepciones } = useApi<any[]>("/lotes-proveedor/");
    const { data: lotesProduccion } = useApi<any[]>("/lotes-produccion/");
    const { data: equiposTempPendientes } = useApi<any[]>("/registros-temperatura/pendientes-hoy");

    const tareasPendientesHoy = (checklistHoy ?? []).filter((tarea) => tarea.estado === "Pendiente").length;
    const recepcionesEnCurso = (recepciones ?? []).filter((recepcion) => recepcion.activo && recepcion.estado !== "acomodado").length;
    const lotesEnProduccion = (lotesProduccion ?? []).filter((lote) => lote.activo && lote.estado === "En produccion").length;
    const controlesTempPendientes = (equiposTempPendientes ?? []).length;

    return (
        <Container fluid className="dashboard-page">
            <div className="dashboard-heading">
                <div>
                    <span className="dashboard-eyebrow">PANEL DE OPERACIONES</span>
                    <h1>Bienvenido/a, {nombre}</h1>
                    <p>Selecciona una actividad para comenzar tu turno de trabajo.</p>
                </div>
            </div>

            <Row className="g-3 mb-4">
                <Col xs={12} sm={6} xl={3}>
                    <MetricCard
                        label="Checklists pendientes hoy"
                        value={String(tareasPendientesHoy)}
                        icon="bi-check2-square"
                        tone={tareasPendientesHoy > 0 ? SEAFOAM.warning : SEAFOAM.primary}
                        detail="Tareas programadas para el turno"
                        to="/checklist"
                    />
                </Col>
                <Col xs={12} sm={6} xl={3}>
                    <MetricCard
                        label="Recepciones en curso"
                        value={String(recepcionesEnCurso)}
                        icon="bi-truck"
                        tone={recepcionesEnCurso > 0 ? SEAFOAM.info : SEAFOAM.secondary}
                        detail="En llegada o desempaque"
                        to="/recepciones"
                    />
                </Col>
                <Col xs={12} sm={6} xl={3}>
                    <MetricCard
                        label="Lotes en produccion"
                        value={String(lotesEnProduccion)}
                        icon="bi-box2-fill"
                        tone={SEAFOAM.primary}
                        detail="Lotes activos fabricandose"
                        to="/lotes-produccion"
                    />
                </Col>
                <Col xs={12} sm={6} xl={3}>
                    <MetricCard
                        label="Controles de temperatura hoy"
                        value={String(controlesTempPendientes)}
                        icon="bi-thermometer-half"
                        tone={controlesTempPendientes > 0 ? SEAFOAM.warning : SEAFOAM.primary}
                        detail={controlesTempPendientes > 0 ? "Equipos pendientes de medicion" : "Todos controlados hoy"}
                        to="/equipos"
                    />
                </Col>
            </Row>
            <Row className="g-3">
                <Col xs={12} md={6} xl={4}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="d-flex flex-column justify-content-between p-4">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <i className={`bi bi-check2-square fs-4 text-primary`} aria-hidden="true" />
                                    <h2 className="h5 mb-0">Checklist del día</h2>
                                </div>
                                <p className="text-muted small mb-3">Revisá y completá las tareas de limpieza programadas.</p>
                            </div>
                            <div>
                                <Button variant="outline-primary" size="sm"
                                    onClick={() => navigate("/checklist")}
                                >
                                    Ingresar <i className="bi bi-arrow-right ms-1" />
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} md={6} xl={4}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="d-flex flex-column justify-content-between p-4">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <i className={`bi bi-journal-text fs-4 text-primary`} aria-hidden="true" />
                                    <h2 className="h5 mb-0">Recetas</h2>
                                </div>
                                <p className="text-muted small mb-3">Consultá la versión vigente de la receta antes de elaborar.</p>
                            </div>
                            <div>
                                <Button variant="outline-primary" size="sm"
                                    onClick={() => navigate("/recetas")}
                                >
                                    Ingresar <i className="bi bi-arrow-right ms-1" />
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} md={6} xl={4}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="d-flex flex-column justify-content-between p-4">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <i className={`bi bi-list-check fs-4 text-primary`} aria-hidden="true" />
                                    <h2 className="h5 mb-0">Tareas</h2>
                                </div>
                                <p className="text-muted small mb-3">Consultá el listado general de tareas operativas.</p>
                            </div>
                            <div>
                                <Button variant="outline-primary" size="sm"
                                    onClick={() => navigate("/tareas")}
                                >
                                    Ingresar <i className="bi bi-arrow-right ms-1" />
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} md={6} xl={4}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="d-flex flex-column justify-content-between p-4">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <i className={`bi bi-exclamation-diamond fs-4 text-primary`} aria-hidden="true" />
                                    <h2 className="h5 mb-0">Reportar incidente</h2>
                                </div>
                                <p className="text-muted small mb-3">Registrá cualquier hallazgo, rotura o desvío.</p>
                            </div>
                            <div>
                                <Button variant="outline-danger" size="sm"
                                    onClick={() => navigate("/incidentes")}
                                >
                                    Ingresar <i className="bi bi-arrow-right ms-1" />
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} md={6} xl={4}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="d-flex flex-column justify-content-between p-4">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <i className={`bi bi-box2-fill fs-4 text-primary`} aria-hidden="true" />
                                    <h2 className="h5 mb-0">Lotes de producción</h2>
                                </div>
                                <p className="text-muted small mb-3">Crea un nuevo lote y asociá los insumos utilizados.</p>
                            </div>
                            <div>
                                <Button variant="outline-secondary" size="sm"
                                    onClick={() => navigate("/lotes-produccion")}
                                >
                                    Ingresar <i className="bi bi-arrow-right ms-1" />
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} md={6} xl={4}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="d-flex flex-column justify-content-between p-4">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <i className={`bi bi-file-text fs-4 text-primary`} aria-hidden="true" />
                                    <h2 className="h5 mb-0">Documentos</h2>
                                </div>
                                <p className="text-muted small mb-3">Consultá las versiones vigentes antes de operar.</p>
                            </div>
                            <div>
                                <Button variant="outline-secondary" size="sm"
                                    onClick={() => navigate("/documentos")}
                                >
                                    Ingresar <i className="bi bi-arrow-right ms-1" />
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>        
            </Row>
        </Container>
    );
}

function VistaAdmin() {
    const { currentUser } = useAuth();
    const esOperador = currentUser?.operar === true;

    const today = useMemo(() => new Date(), []);
    const fromDate = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() - 29);
        return date;
    }, []);

    const historyUrl = `/tareas-ocurrencia/historial?fecha_desde=${toDateKey(fromDate)}&fecha_hasta=${toDateKey(today)}`;
    const { data: history, error: historyError, isLoading: historyLoading } = useApi<TareaOcurrencia[]>(
        esOperador ? null : historyUrl,
    );
    const occurrences = useMemo(() => history ?? [], [history]);

    //estadistica incidente
    const incidentsUrl = `/incidentes?fecha_desde=${toDateKey(fromDate)}&fecha_hasta=${toDateKey(today)}`;
    const { data: incidents, error: incidentsError, isLoading: incidentsLoading, } = useApi<IncidenteSeguimiento[]>(incidentsUrl);
    const incidentes = (incidents ?? []).filter((incidente) => incidente.activo);
    const totalIncidentes = incidentes.length;
    const incidentesAbiertos = incidentes.filter((incidente) => incidente.estado === "Abierto").length;
    const incidentesCerrados = incidentes.filter((incidente) => incidente.estado === "Cerrado").length;
    const porcentajeResueltos = totalIncidentes > 0
        ? Math.round((incidentesCerrados / totalIncidentes) * 1000) / 10
        : null;
    const incidentesPorTipo = useMemo(() => {
        const cantidades = new Map<string, number>();
        incidentes.forEach((incidente) => {
            const nombreTipo = incidente.tipo.nombre; cantidades.set(nombreTipo, (cantidades.get(nombreTipo) ?? 0) + 1);
        });

        return Array.from(cantidades, ([tipo, cantidad]) => ({ tipo, cantidad, })).sort((a, b) => b.cantidad - a.cantidad);
    }, [incidentes]);
    //estadistica incidente

    const { data: elements, error: elementsError, isLoading: elementsLoading } = useApi<ElementoLimpieza[]>("/elementos-limpieza/");

    const { data: vencimientosPersonal, error: vencimientosPersonalError, isLoading: vencimientosPersonalLoading } = useApi<VencimientoPersonal[]>(
        currentUser?.administrar ? "/vencimiento-personal/" : null,
    );

    const { data: configuracion } = useApi<ConfiguracionSistema>(
        currentUser?.administrar ? "/configuracion-sistema/" : null,
    );
    const diasAntelacionVencimiento = configuracion?.dias_antelacion_vencimiento ?? 15;
    const diasAntelacionElementos = configuracion?.dias_antelacion_elementos ?? 15;

    const activeElements = (elements ?? []).filter((element) => element.estado);
    const overdueElements = activeElements.filter((element) =>
        element.dias_restantes !== null
        && element.dias_restantes < 0);
    const dueSoonElements = activeElements.filter((element) =>
        element.dias_restantes !== null
        && element.dias_restantes >= 0
        && element.dias_restantes <= diasAntelacionElementos);

    const { data: planesCalibracion, error: planesCalibracionError, isLoading: planesCalibracionLoading } = useApi<PlanCalibracion[]>(
        currentUser?.administrar ? "/planes-calibracion/" : null,
    );
    const { data: insumosLote, isLoading: insumosLoteLoading, error: insumosLoteError } = useApi<any[]>(
        currentUser?.administrar ? "/insumos-lote/" : null,
    );
    const { data: proveedores, isLoading: proveedoresLoading, error: proveedoresError } = useApi<any[]>(
        currentUser?.administrar ? "/proveedores/" : null,
    );
    const { data: pedidosProveedor, isLoading: pedidosLoading, error: pedidosError } = useApi<any[]>(
        currentUser?.administrar ? "/pedidos-proveedor/" : null,
    );

    const hoySinHora = useMemo(() => {
        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0);
        return fechaActual;
    }, []);

    const insumosLoteRiesgo = useMemo(() => {
        return (insumosLote ?? []).filter((insumoLote) => {
            if (!insumoLote.activo || insumoLote.cantidad_restante <= 0 || !insumoLote.fecha_vencimiento) return false;
            const partes = String(insumoLote.fecha_vencimiento).split("-");
            const fechaVencimiento = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
            const dias = Math.round((fechaVencimiento.getTime() - hoySinHora.getTime()) / (1000 * 60 * 60 * 24));
            return dias <= 15;
        });
    }, [insumosLote, hoySinHora]);

    const proveedoresHabilitacionRiesgo = useMemo(() => {
        return (proveedores ?? []).filter((proveedor) => {
            if (!proveedor.activo || !proveedor.vencimiento_habilitacion) return false;
            const partes = String(proveedor.vencimiento_habilitacion).split("-");
            const fechaVencimiento = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
            const dias = Math.round((fechaVencimiento.getTime() - hoySinHora.getTime()) / (1000 * 60 * 60 * 24));
            return dias <= 30;
        });
    }, [proveedores, hoySinHora]);

    const pedidosDemorados = useMemo(() => {
        return (pedidosProveedor ?? []).filter((pedido) => {
            if (!pedido.activo || pedido.estado !== "pendiente" || !pedido.fecha_entrega_estimada) return false;
            const partes = String(pedido.fecha_entrega_estimada).split("-");
            const fechaEntrega = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
            return fechaEntrega.getTime() <= hoySinHora.getTime();
        });
    }, [pedidosProveedor, hoySinHora]);
    const planesCalibracionActivos = (planesCalibracion ?? []).filter((plan) => plan.estado);
    const planesCalibracionVencidosOProximos = planesCalibracionActivos.filter((plan) => {
        const estado = clasificarPorDiasRestantes(plan.dias_restantes, diasAntelacionVencimiento);
        return estado === "vencido" || estado === "proximo";
    });
    const estadosPorPersona = useMemo(() => {
        const porPersona = new Map<number, VencimientoPersonal[]>();
        (vencimientosPersonal ?? []).forEach((vencimiento) => {
            const lista = porPersona.get(vencimiento.persona_id) ?? [];
            lista.push(vencimiento);
            porPersona.set(vencimiento.persona_id, lista);
        });
        return Array.from(porPersona.values()).map((lista) => calcularEstadoVencimientos(lista, diasAntelacionVencimiento));
    }, [vencimientosPersonal, diasAntelacionVencimiento]);
    const vencimientosPersonalVencidos = estadosPorPersona.filter((estado) => estado === "vencido");
    const vencimientosPersonalProximos = estadosPorPersona.filter((estado) => estado === "proximo");
    const vencimientosConsolidadosTotal = overdueElements.length + dueSoonElements.length
        + vencimientosPersonalVencidos.length + vencimientosPersonalProximos.length
        + planesCalibracionVencidosOProximos.length;

    const vencimientosConsolidadosLoading = elementsLoading || vencimientosPersonalLoading || planesCalibracionLoading;
    const vencimientosConsolidadosError = Boolean(elementsError) || Boolean(vencimientosPersonalError) || Boolean(planesCalibracionError);

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
            { name: `Por vencer · ${diasAntelacionElementos} días`, value: dueSoonElements.length, color: SEAFOAM.warning },
            { name: "Vencidos", value: overdueElements.length, color: SEAFOAM.danger },
            { name: "Sin frecuencia", value: withoutSchedule, color: "#a7b1ba" },
        ].filter((item) => item.value > 0);
    }, [activeElements, dueSoonElements.length, overdueElements.length, diasAntelacionElementos]);

    const historyHasError = Boolean(historyError);
    const inventoryHasError = Boolean(elementsError);
    const formatMetric = (loading: boolean, error: boolean, value: number | string) =>
        loading ? "…" : error ? "—" : value;

    const graficoActividadRef = useRef<HTMLDivElement>(null);
    const graficoRecambiosRef = useRef<HTMLDivElement>(null);
    const graficoIncidentesRef = useRef<HTMLDivElement>(null);

    return (
        <Container fluid className="dashboard-page">
            <div className="dashboard-heading">
                <div>
                    <span className="dashboard-eyebrow">PANEL DE CONTROL</span>
                    <h1>Resumen operativo</h1>
                    <p>Actividad de checklists e indicadores de limpieza de los últimos 30 días.</p>
                </div>
                <span className="dashboard-period" data-tour="periodo-panel"><i className="bi bi-calendar3 me-2" />Últimos 30 días</span>
            </div>

            {(historyHasError || inventoryHasError) && (
                <Alert variant="warning" className="dashboard-alert">
                    No se pudieron cargar algunos indicadores. Los datos disponibles siguen visibles.
                </Alert>
            )}

            {!esOperador && <section aria-label="Indicadores de checklists" className="mb-4" data-tour="seccion-checklists">
                <div className="dashboard-section-heading">
                    <div>
                        <h2>Checklists</h2>
                        <span>Seguimiento de tareas programadas</span>
                    </div>
                    {historyLoading && <Spinner animation="border" size="sm" variant="success" aria-label="Cargando historial" />}
                </div>
                <Row className="g-3">
                    <Col xs={6} xl={3}><MetricCard label="Total de tareas" value={formatMetric(historyLoading, historyHasError, occurrences.length)} icon="bi-list-task" tone={SEAFOAM.primary} detail="En el período seleccionado" to="/historial" /></Col>
                    <Col xs={6} xl={3}><MetricCard label="Completadas" value={formatMetric(historyLoading, historyHasError, completed)} icon="bi-check2-circle" tone={SEAFOAM.success} detail="Registradas correctamente" /></Col>
                    <Col xs={6} xl={3}><MetricCard label="Incumplidas" value={formatMetric(historyLoading, historyHasError, overdueTasks)} icon="bi-exclamation-circle" tone={SEAFOAM.danger} detail={`${pendingTasks} pendientes`} /></Col>
                    <Col xs={6} xl={3}><MetricCard label="Cumplimiento" value={historyLoading ? "…" : historyHasError || compliance === null ? "—" : `${compliance}%`} icon="bi-speedometer2" tone={SEAFOAM.secondary} detail="Sobre tareas resueltas" /></Col>
                </Row>
            </section>}


            {!esOperador && <section aria-label="Indicadores de incidentes" className="mb-4">
                <div className="dashboard-section-heading">
                    <div>
                        <h2>Incidentes</h2>
                        <span>Seguimiento de los incidentes registrados</span>
                    </div>
                    {incidentsLoading && (<Spinner animation="border" size="sm" variant="success" aria-label="Cargando incidentes" />)}
                </div>
                <Row className="g-3">
                    <Col xs={6} xl={3}><MetricCard
                        label="Total de incidentes" value={formatMetric(incidentsLoading, Boolean(incidentsError), totalIncidentes)}
                        icon="bi-exclamation-triangle" tone={SEAFOAM.primary} detail="Registrados en el período" to="/incidentes-historial" />
                    </Col>
                    <Col xs={6} xl={3}><MetricCard
                        label="Abiertos" value={formatMetric(incidentsLoading, Boolean(incidentsError), incidentesAbiertos)}
                        icon="bi-hourglass-split" tone={SEAFOAM.warning} detail="Pendientes de resolución" />
                    </Col>
                    <Col xs={6} xl={3}><MetricCard
                        label="Cerrados" value={formatMetric(incidentsLoading, Boolean(incidentsError), incidentesCerrados)}
                        icon="bi-check2-circle" tone={SEAFOAM.success} detail="Incidentes resueltos" />
                    </Col>
                    <Col xs={6} xl={3}><MetricCard
                        label="Resueltos" value={incidentsLoading ? "…" : incidentsError || porcentajeResueltos === null ? "—" : `${porcentajeResueltos.toLocaleString("es-AR")}%`}
                        icon="bi-speedometer2" tone={SEAFOAM.secondary} detail="Sobre el total del período" />
                    </Col>
                </Row>
            </section>}

            {!esOperador && <section aria-label="Indicadores de inventario" className="mb-4" data-tour="seccion-inventario">
                <div className="dashboard-section-heading">
                    <div>
                        <h2>Inventario, recambios y vencimientos</h2>
                        <span>Elementos activos, fechas de recambio y vencimientos de personal</span>
                    </div>
                    {(elementsLoading || vencimientosPersonalLoading || planesCalibracionLoading) && <Spinner animation="border" size="sm" variant="success" aria-label="Cargando inventario" />}
                </div>
                <Row className="g-3">
                    <Col xs={6} md={4} xl={3} data-tour="card-elementos-vencidos">
                        <MetricCard
                            label="Elementos vencidos"
                            value={formatMetric(elementsLoading, Boolean(elementsError), overdueElements.length)}
                            icon="bi-calendar-x" tone={SEAFOAM.danger}
                            detail="Requieren recambio"
                            to="/vencimientos?default=elementos"
                        />
                    </Col>
                    <Col xs={6} md={4} xl={3} data-tour="card-elementos-por-vencer">
                        <MetricCard
                            label="Elementos Por vencer"
                            value={formatMetric(elementsLoading, Boolean(elementsError), dueSoonElements.length)}
                            icon="bi-calendar2-week"
                            tone={SEAFOAM.warning}
                            detail={`Dentro de los próximos ${diasAntelacionElementos} días`}
                            to="/vencimientos?default=elementos"
                        />
                    </Col>
                    {!esOperador && <Col xs={6} md={4} xl={3} data-tour="card-personal-vencidos">
                        <MetricCard
                            label="Personal vencidos"
                            value={currentUser?.administrar ? formatMetric(vencimientosPersonalLoading,
                                Boolean(vencimientosPersonalError), vencimientosPersonalVencidos.length) : "—"}
                            icon="bi-person-x"
                            tone={SEAFOAM.danger}
                            detail={currentUser?.administrar ? "Vencimientos de personal" : "Solo administración"}
                            to={currentUser?.administrar ? "/vencimientos?default=personal" : undefined}
                        />
                    </Col>}
                    {!esOperador && <Col xs={6} md={4} xl={3} data-tour="card-personal-por-vencer">
                        <MetricCard
                            label="Personal por vencer"
                            value={currentUser?.administrar ? formatMetric(vencimientosPersonalLoading, Boolean(vencimientosPersonalError), vencimientosPersonalProximos.length) : "—"}
                            icon="bi-person-exclamation"
                            tone={SEAFOAM.warning}
                            detail={currentUser?.administrar ? "Dentro de la antelación configurada" : "Solo administración"}
                            to={currentUser?.administrar ? "/vencimientos?default=personal" : undefined}
                        />
                    </Col>}
                    {!esOperador && <Col xs={6} md={4} xl={3} data-tour="card-vencimientos-consolidados">
                        <MetricCard
                            label="Vencimientos consolidados"
                            value={currentUser?.administrar ? formatMetric(vencimientosConsolidadosLoading, vencimientosConsolidadosError, vencimientosConsolidadosTotal) : "—"}
                            icon="bi-calendar-x"
                            tone={SEAFOAM.info}
                            detail={currentUser?.administrar ? "Personal, elementos y equipos" : "Solo administración"}
                            to={currentUser?.administrar ? "/vencimientos" : undefined}
                        />
                    </Col>}
                    {currentUser?.administrar && <Col xs={6} md={4} xl={3}>
                        <MetricCard
                            label="Insumos lote en riesgo"
                            value={formatMetric(insumosLoteLoading, Boolean(insumosLoteError), insumosLoteRiesgo.length)}
                            icon="bi-egg"
                            tone={insumosLoteRiesgo.length > 0 ? SEAFOAM.warning : SEAFOAM.primary}
                            detail="Vencidos o por vencer (<= 15 dias)"
                            to="/insumos-lote"
                        />
                    </Col>}
                    {currentUser?.administrar && <Col xs={6} md={4} xl={3}>
                        <MetricCard
                            label="Habilitaciones proveedor"
                            value={formatMetric(proveedoresLoading, Boolean(proveedoresError), proveedoresHabilitacionRiesgo.length)}
                            icon="bi-building-exclamation"
                            tone={proveedoresHabilitacionRiesgo.length > 0 ? SEAFOAM.warning : SEAFOAM.primary}
                            detail="Vencidas o por vencer (<= 30 dias)"
                            to="/proveedores"
                        />
                    </Col>}
                    {currentUser?.administrar && <Col xs={6} md={4} xl={3}>
                        <MetricCard
                            label="Pedidos demorados"
                            value={formatMetric(pedidosLoading, Boolean(pedidosError), pedidosDemorados.length)}
                            icon="bi-clock-history"
                            tone={pedidosDemorados.length > 0 ? SEAFOAM.danger : SEAFOAM.primary}
                            detail="Pendientes con fecha vencida"
                            to="/pedidos-proveedor"
                        />
                    </Col>}
                </Row>
            </section>}

                <Row className="g-3 mb-4 dashboard-charts">
                {!esOperador && <Col xl={7}>
                    <Card className="dashboard-chart-card h-100" data-tour="grafico-actividad">
                        <Card.Body>
                            <div className="dashboard-chart-heading">
                                <div>
                                    <h2>Actividad de tareas</h2>
                                    <p>Resultado diario de los últimos 7 días</p>
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                    <ExportarGraficoButton
                                        periodo="Últimos 7 días"
                                        contenedorRef={graficoActividadRef}
                                        titulo="Actividad de tareas"
                                        subtitulo="Resultado diario de los últimos 7 días"
                                        disabled={historyLoading || historyHasError || occurrences.length === 0}
                                    />
                                    <span className="dashboard-chart-icon">
                                        <i className="bi bi-bar-chart-line" />
                                    </span>
                                </div>
                            </div>

                            <div
                                ref={graficoActividadRef}
                                className="dashboard-chart-area"
                                role="img"
                                aria-label="Gráfico de tareas completadas, incumplidas y pendientes por día"
                            >
                                {historyLoading ?
                                    <div className="dashboard-chart-message">
                                        <Spinner animation="border" size="sm" />
                                        Cargando actividad…
                                    </div> : historyHasError ?
                                        <div className="dashboard-chart-message">
                                            No se pudo cargar la actividad.
                                        </div> : occurrences.length === 0 ?
                                            <div className="dashboard-chart-message">
                                                Todavía no hay tareas en este período.
                                            </div> : (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={activityByDay}
                                                        margin={{ top: 10, right: 10, left: -18, bottom: 0 }}
                                                        barGap={4}
                                                    >
                                                        <CartesianGrid
                                                            stroke="#e9eef2"
                                                            vertical={false}
                                                        />
                                                        <XAxis
                                                            dataKey="label"
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tick={{ fill: "#718096", fontSize: 12 }}
                                                        />
                                                        <YAxis
                                                            allowDecimals={false}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tick={{ fill: "#8a969e", fontSize: 11 }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                border: "1px solid #e7ecef",
                                                                borderRadius: 10,
                                                                boxShadow: "0 8px 24px rgba(35, 50, 60, .12)"
                                                            }}
                                                        />
                                                        <Legend
                                                            iconType="circle"
                                                            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                                                        />
                                                        <Bar dataKey="completed" name="Completadas" fill={SEAFOAM.primary} radius={[5, 5, 0, 0]} maxBarSize={25} />
                                                        <Bar dataKey="overdue" name="Incumplidas" fill={SEAFOAM.danger} radius={[5, 5, 0, 0]} maxBarSize={25} />
                                                        <Bar dataKey="pending" name="Pendientes" fill={SEAFOAM.warning} radius={[5, 5, 0, 0]} maxBarSize={25} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>}

                <Col xl={esOperador ? 12 : 5}>
                    {!esOperador && 
                    <Card className="dashboard-chart-card h-100" data-tour="grafico-recambios">
                        <Card.Body>
                            <div className="dashboard-chart-heading">
                                <div>
                                    <h2>Estado de recambios</h2>
                                    <p>Estado de los elementos activos</p>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <ExportarGraficoButton
                                    periodo={`Al ${new Date().toLocaleDateString("es-AR")}`}
                                    contenedorRef={graficoRecambiosRef}
                                    titulo="Estado de recambios"
                                    subtitulo="Estado de los elementos activos"
                                    disabled={elementsLoading || Boolean(elementsError) || activeElements.length === 0}
                                />
                                    <span className="dashboard-chart-icon">
                                        <i className="bi bi-arrow-repeat" />
                                    </span>
                                </div>
                            </div>
                            <div ref={graficoRecambiosRef}>
                                <div
                                    className="dashboard-donut-area"
                                    role="img"
                                    aria-label="Distribución de elementos al día, por vencer, vencidos y sin frecuencia"
                                >
                                    {elementsLoading ?
                                        <div className="dashboard-chart-message">
                                            <Spinner animation="border" size="sm" />
                                            Cargando recambios…
                                        </div> : elementsError ?
                                            <div className="dashboard-chart-message">
                                                No se pudo cargar el estado de recambios.
                                            </div> : activeElements.length === 0 ?
                                                <div className="dashboard-chart-message">
                                                    No hay elementos activos para mostrar.
                                                </div> : (
                                                    <>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={replacementStatus}
                                                                    dataKey="value"
                                                                    nameKey="name"
                                                                    innerRadius={64}
                                                                    outerRadius={91}
                                                                    paddingAngle={3}
                                                                    stroke="none"
                                                                >
                                                                    {replacementStatus.map((item) => <Cell key={item.name} fill={item.color} />)}
                                                                </Pie>
                                                                <Tooltip
                                                                    contentStyle={{
                                                                        border: "1px solid #e7ecef",
                                                                        borderRadius: 10,
                                                                        boxShadow: "0 8px 24px rgba(35, 50, 60, .12)"
                                                                    }}
                                                                />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                        <div className="dashboard-donut-center">
                                                            <strong>{activeElements.length}</strong>
                                                            <span>activos</span>
                                                        </div>
                                                    </>
                                                )}
                                </div>
                                <div className="dashboard-chart-legend">
                                    {replacementStatus.map((item) => (
                                        <span key={item.name}>
                                            <i style={{ backgroundColor: item.color }} />
                                            {item.name}
                                            <strong>
                                                {item.value}
                                            </strong>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>}
                </Col>
            </Row>
            <Row className="g-3 mb-4 dashboard-charts">
                {!esOperador && <Col xs={12}>
                    <Card className="dashboard-chart-card">
                        <Card.Body>
                            <div className="dashboard-chart-heading">
                                <div>
                                    <h2>Incidentes por tipo</h2>
                                    <p>Cantidad registrada en los últimos 30 días</p>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <ExportarGraficoButton
                                        periodo="Últimos 30 días"
                                        contenedorRef={graficoIncidentesRef}
                                        titulo="Incidentes por tipo"
                                        subtitulo="Cantidad registrada en los últimos 30 días"
                                        disabled={incidentsLoading || Boolean(incidentsError) || incidentes.length === 0}
                                    />
                                    <span className="dashboard-chart-icon">
                                        <i className="bi bi-bar-chart-line" />
                                    </span>
                                </div>
                            </div>
                            <div
                                ref={graficoIncidentesRef}
                                className="dashboard-chart-area" 
                                role="img" 
                                aria-label="Cantidad de incidentes agrupados por tipo" 
                            >
                                {incidentsLoading ? (<div className="dashboard-chart-message"> <Spinner animation="border" size="sm" /> {" "}Cargando incidentes…</div>
                                ) : incidentsError ? (
                                    <div className="dashboard-chart-message"> No se pudieron cargar los incidentes. </div>
                                ) : incidentes.length === 0 ? (
                                    <div className="dashboard-chart-message"> No hay incidentes registrados en este período. </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={incidentesPorTipo} margin={{ top: 10, right: 20, left: -18, bottom: 5, }}>
                                            <CartesianGrid stroke="#e9eef2" vertical={false} />
                                            <XAxis dataKey="tipo" tickLine={false} axisLine={false} tick={{ fill: "#718096", fontSize: 12, }} interval={0} />
                                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#8a969e", fontSize: 11, }} />
                                            <Tooltip contentStyle={{ border: "1px solid #e7ecef", borderRadius: 10, }} />
                                            <Bar dataKey="cantidad" name="Incidentes" fill={SEAFOAM.primary} radius={[5, 5, 0, 0]} maxBarSize={45} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>}
            </Row>

            {currentUser?.administrar && (
                <>
                    <EstadisticasLotes />
                    <Row className="g-3 mb-4 dashboard-charts">
                        <Col xs={12}>
                            <CumplimientoChart />
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
}
