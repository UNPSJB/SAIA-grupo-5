export type TipoIncidente = {
    id: number
    nombre: string
    descripcion: string
    activo: boolean
}

export type NewTipoIncidente = {
    nombre: string
    descripcion?: string
}