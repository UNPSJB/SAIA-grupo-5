export type TipoDocumento = {
    id: number
    nombre: string
    descripcion: string
    activo: boolean
}

export type NewTipoDocumento = {
    nombre: string
    descripcion?: string
}