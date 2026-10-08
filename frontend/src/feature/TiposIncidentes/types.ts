export type TipoIncidente = {
    id: number
    nombre: string
    descripcion: string
    estado: boolean
}

export type NewTipoIncidente = {
    nombre: string
    descripcion?: string
}