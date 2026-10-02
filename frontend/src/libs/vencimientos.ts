import type { VencimientoPersonal } from "../feature/VencimientoPersonal/types";

export type EstadoVencimiento = "Vencido" | "Proximo";

export type VencimientoClasificado = VencimientoPersonal & {
    diasRestantes: number;
    estado: EstadoVencimiento;
};

export const ANTELACION_DIAS_DEFAULT = 15;

function diasRestantesHasta(fecha: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const objetivo = new Date(`${fecha}T00:00:00`);
    const MS_POR_DIA = 1000 * 60 * 60 * 24;
    return Math.round((objetivo.getTime() - hoy.getTime()) / MS_POR_DIA);
}

export function clasificarVencimientos(
    vencimientos: VencimientoPersonal[],
    antelacionDias: number = ANTELACION_DIAS_DEFAULT,
): VencimientoClasificado[] {
    return vencimientos
        .map((vencimiento) => {
            const diasRestantes = diasRestantesHasta(vencimiento.fecha_hasta);
            const estado: EstadoVencimiento = diasRestantes < 0 ? "Vencido" : "Proximo";
            return { ...vencimiento, diasRestantes, estado };
        })
        .filter((vencimiento) => vencimiento.diasRestantes <= antelacionDias)
        .sort((a, b) => a.diasRestantes - b.diasRestantes);
}
