export const Frecuencia = {
    DIARIA: 1,
    SEMANAL: 7,
    QUINCENAL: 15,
    MENSUAL: 30,
} as const;

export type Frecuencia = typeof Frecuencia[keyof typeof Frecuencia];

export const FRECUENCIA_LABELS: Record<Frecuencia, string> = {
    [Frecuencia.DIARIA]: "Diaria",
    [Frecuencia.SEMANAL]: "Semanal",
    [Frecuencia.QUINCENAL]: "Quincenal",
    [Frecuencia.MENSUAL]: "Mensual",
};

export const Prioridad = {
    ALTA: "alta",
    MEDIA: "media",
    BAJA: "baja",
} as const;

export type Prioridad = typeof Prioridad[keyof typeof Prioridad];

export const PRIORIDAD_LABELS: Record<Prioridad, string> = {
    [Prioridad.ALTA]: "Alta",
    [Prioridad.MEDIA]: "Media",
    [Prioridad.BAJA]: "Baja",
};

export const PRIORIDAD_VARIANTS: Record<Prioridad, string> = {
    [Prioridad.ALTA]: "danger",
    [Prioridad.MEDIA]: "warning",
    [Prioridad.BAJA]: "secondary",
};

export type Tarea = {
    id: number
    nombre: string
    descripcion: string | null
    frecuencia: Frecuencia
    prioridad: Prioridad
    foto_obligatoria: boolean
    accion_correctiva: string | null
    procedimiento: string[] | null // Lista de pasos consecutivos en orden
    plan_limpieza_id: number
    activo: boolean
}

// Campos editables del formulario de Alta/Edición de Tarea
export type TareaFormData = {
    nombre: string
    descripcion: string | null
    frecuencia: Frecuencia
    prioridad: Prioridad
    foto_obligatoria: boolean
    accion_correctiva: string | null
    procedimiento: string[] | null
}

export type NewTarea = TareaFormData & {
    plan_limpieza_id: number
}
