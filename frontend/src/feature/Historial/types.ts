import { type TareaOcurrencia } from "../TareasOcurrencias/types";
import type { TonoEstado } from "../../components/EstadoBadge";

export type EstadoTareaOcurrencia = "Pendiente" | "Completada";



export type EstadoHistorial = "Completada" | "Pendiente" | "Incumplida";

// La tarea sigue "Pendiente" durante toda su ventana de frecuencia, 
// solo se marca "Incumplida" una vez pasada esa frecuencia
export function getEstadoHistorial(ocurrencia: TareaOcurrencia): EstadoHistorial {
    if (ocurrencia.estado === "Completada") return "Completada";

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fecha = new Date(`${ocurrencia.fecha}T00:00:00`);
    const frecuenciaDias = Number(ocurrencia.frecuencia_snap) || 0;
    const fechaLimite = new Date(fecha);
    fechaLimite.setDate(fechaLimite.getDate() + frecuenciaDias);

    return hoy > fechaLimite ? "Incumplida" : "Pendiente";
}

export const ESTADO_HISTORIAL_ESTILOS: Record<EstadoHistorial, { tono: TonoEstado; icono: string }> = {
    Completada: { tono: "success", icono: "bi-check-circle-fill" },
    Pendiente: { tono: "warning", icono: "bi-hourglass-split" },
    Incumplida: { tono: "danger", icono: "bi-x-circle-fill" },
};
