import {CartesianGrid, Line,LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import type { RegistroTemperatura } from '../types';

interface GraficoTemperaturaEquipoProps {
    registros: RegistroTemperatura[];
    temperaturaMinima: number;
    temperaturaMaxima: number;
}

interface PuntoGrafico {
    fechaCorta: string;
    fechaCompleta: string;
    temperatura: number;
    fueraDeRango: boolean;
    operario: string;
    accion: string | null;
}

function TooltipTemperatura({ active, payload }: { active?: boolean; payload?: any[] }) {
    if (!active || !payload || payload.length === 0) return null;
    const punto = payload[0].payload as PuntoGrafico;
    return (
        <div className="bg-white p-2 px-3 border rounded shadow-sm small" style={{ maxWidth: 260 }}>
            <div className="fw-bold text-dark">{punto.fechaCompleta}</div>
            <div className={`fw-bold ${punto.fueraDeRango ? 'text-danger' : 'text-success'}`}>
                Temperatura: {punto.temperatura} C {punto.fueraDeRango ? '(Fuera de rango)' : '(En rango)'}
            </div>
            <div className="text-muted">Registrado por: {punto.operario}</div>
            {punto.accion && (
                <div className="text-danger mt-1">
                    <strong>Accion tomada:</strong> {punto.accion}
                </div>
            )}
        </div>
    );
}

export function GraficoTemperaturaEquipo({registros, temperaturaMinima, temperaturaMaxima,}: GraficoTemperaturaEquipoProps) {
    if (registros.length === 0) {
        return (
            <p className="text-muted small mb-0">
                Todavia no hay mediciones registradas para graficar la evolucion termica.
            </p>
        );
    }

    const datos: PuntoGrafico[] = [...registros]
        .reverse()
        .map((registro) => {
            const fechaObj = new Date(registro.fecha_hora_registro);
            const fechaCorta = fechaObj.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
            }) + ' ' + fechaObj.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
            const fechaCompleta = fechaObj.toLocaleString('es-AR', { hour12: false });
            return {
                fechaCorta,
                fechaCompleta,
                temperatura: registro.temperatura_registrada,
                fueraDeRango: registro.fuera_de_rango,
                operario: registro.operario
                    ? `${registro.operario.nombre} ${registro.operario.apellido}`
                    : 'Usuario',
                accion: registro.accion_tomada,
            };
        });

    const valores = datos.map((d) => d.temperatura);
    const minY = Math.floor(Math.min(temperaturaMinima, ...valores) - 2);
    const maxY = Math.ceil(Math.max(temperaturaMaxima, ...valores) + 2);

    return (
        <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datos} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="fechaCorta" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[minY, maxY]} unit=" C" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip content={<TooltipTemperatura />} />
                    <ReferenceLine
                        y={temperaturaMaxima}
                        stroke="#dc3545"
                        strokeDasharray="4 4"
                        label={{ value: `Max ${temperaturaMaxima} C`, position: 'insideTopRight', fill: '#dc3545', fontSize: 11 }}
                    />
                    <ReferenceLine
                        y={temperaturaMinima}
                        stroke="#0d6efd"
                        strokeDasharray="4 4"
                        label={{ value: `Min ${temperaturaMinima} C`, position: 'insideBottomRight', fill: '#0d6efd', fontSize: 11 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="temperatura"
                        stroke="#06794f"
                        strokeWidth={2}
                        dot={(props: any) => {
                            const { cx, cy, payload } = props;
                            return (
                                <circle
                                    key={`${cx}-${cy}`}
                                    cx={cx}
                                    cy={cy}
                                    r={5}
                                    fill={payload.fueraDeRango ? '#dc3545' : '#198754'}
                                    stroke="#ffffff"
                                    strokeWidth={1.5}
                                />
                            );
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
