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

// Una tarea es de un sector, una superficie o un equipo: exactamente uno de
// los tres, nunca ninguno ni más de uno (lo valida el backend).
export type RelacionTipo = "sector" | "superficie" | "equipo";

export type FiltroRelacion = "todas" | RelacionTipo;

export const RELACION_URL_SEGMENT: Record<RelacionTipo, string> = {
    sector: "sectores",
    superficie: "superficies",
    equipo: "equipos",
};

export const FILTRO_RELACION_LABELS: Record<FiltroRelacion, string> = {
    todas: "Todas las tareas",
    sector: "Tareas de sector",
    superficie: "Tareas de superficie",
    equipo: "Tareas de equipo",
};

type EntidadMinimal = { id: number; nombre: string };

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
    sector: EntidadMinimal | null
    superficie: EntidadMinimal | null
    equipo: EntidadMinimal | null
}

const RELACION_TIPO_LABELS: Record<RelacionTipo, string> = {
    sector: "Sector",
    superficie: "Superficie",
    equipo: "Equipo",
};

// "Sector" / "Superficie" / "Equipo", según cuál de las tres relaciones tenga
// la tarea (siempre exactamente una) — sin el nombre de la entidad.
export function getRelacionTipoLabel(tarea: Tarea): string | null {
    if (tarea.sector) return RELACION_TIPO_LABELS.sector;
    if (tarea.superficie) return RELACION_TIPO_LABELS.superficie;
    if (tarea.equipo) return RELACION_TIPO_LABELS.equipo;
    return null;
}

// Solo el nombre de la entidad puntual a la que hace referencia (sin el tipo).
export function getRelacionNombre(tarea: Tarea): string | null {
    return tarea.sector?.nombre ?? tarea.superficie?.nombre ?? tarea.equipo?.nombre ?? null;
}

// Campos editables del formulario de Alta/Edición de Tarea.
// relacion_tipo/relacion_id representan en el form cuál de sector/superficie/
// equipo aplica; TareaFormModal los traduce a sector_id/superficie_id/equipo_id.
export type TareaFormData = {
    nombre: string
    descripcion: string | null
    frecuencia: Frecuencia
    prioridad: Prioridad
    foto_obligatoria: boolean
    accion_correctiva: string | null
    procedimiento: string[] | null
    relacion_tipo: RelacionTipo
    relacion_id: number | null
}

export type NewTarea = {
    nombre: string
    descripcion: string | null
    frecuencia: Frecuencia
    prioridad: Prioridad
    foto_obligatoria: boolean
    accion_correctiva: string | null
    procedimiento: string[] | null
    plan_limpieza_id: number
    sector_id: number | null
    superficie_id: number | null
    equipo_id: number | null
}
