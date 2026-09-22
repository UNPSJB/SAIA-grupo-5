export type PlanLimpieza = {
    id: number
    nombre: string
    descripcion: string | null
    activo: boolean
    sectores: { id: number; nombre: string }[]
    superficies: { id: number; nombre: string }[]
    equipos: { id: number; nombre: string }[]
}

export type NewPlanLimpieza = {
    nombre: string
    descripcion: string | null
    sector_ids: number[]
    superficie_ids: number[]
}
