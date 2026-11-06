export type ElementoLimpieza = {
    id: number
    codigo: string
    nombre: string
    tipo_id: number
    material: string | null
    ubicacion: string | null
    frecuencia_recambio: number | null
    fecha_alta: string
    dias_restantes: number | null
    estado: boolean
}

export type NewElementoLimpieza = {
    nombre: string
    tipo_id: number
    material?: string | null
    ubicacion?: string | null
    frecuencia_recambio?: number | null
}
