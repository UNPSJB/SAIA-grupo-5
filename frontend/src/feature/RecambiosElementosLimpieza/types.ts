export type RecambioElementoLimpieza = {
    id: number
    elemento_id: number
    fecha: string
    observacion: string | null
}

export type NewRecambioElementoLimpieza = {
    fecha?: string | null
    observacion?: string | null
}