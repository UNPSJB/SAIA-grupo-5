export const EstadoTareaOcurrencia = {
    PENDIENTE: "Pendiente",
    COMPLETADA: "Completada",
} as const;

export type EstadoTareaOcurrencia = typeof EstadoTareaOcurrencia[keyof typeof EstadoTareaOcurrencia];

export type TareaOcurrencia = {
    id: number
    operario_id: number | null
    tarea_nombre_snap: string
    tarea_descripcion_snap: string | null
    frecuencia_snap: string
    plan_nombre_snap: string
    fecha: string   
    fecha_completado: string | null
    estado: EstadoTareaOcurrencia
}