export type Superficie = {
    id: number
    nombre: string
    tipo_contacto: string
    activo: boolean
    sectores: { id: number; nombre: string }[]
    planes: { id: number; nombre: string }[]
}

export type NewSuperficie = {
    nombre: string
    tipo_contacto: string
    sector_ids: number[]
    plan_limpieza_ids: number[]
}
