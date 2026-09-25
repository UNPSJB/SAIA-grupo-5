export type EstadoTareaOcurrencia = "Pendiente" | "Completada";

export type TareaOcurrencia = {
    id: number
    operario_id: number | null
    tarea_nombre_snap: string
    tarea_descripcion_snap: string | null
    frecuencia_snap: string
    prioridad_snap: string
    foto_obligatoria_snap: boolean
    accion_correctiva_snap: string | null
    plan_nombre_snap: string
    fecha: string
    fecha_completado: string | null
    estado: EstadoTareaOcurrencia
}

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

export const ESTADO_HISTORIAL_VARIANTS: Record<EstadoHistorial, string> = {
    Completada: "success",
    Pendiente: "secondary",
    Incumplida: "danger",
};
