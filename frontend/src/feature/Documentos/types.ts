import type { TipoDocumento } from "../TipoDocumento/types"

export type Documento = {
    id: number
    nombre: string
    descripcion: string
    activo: boolean
    tipo_id: number
    tipo: TipoDocumento
}

export type NewDocumento = {
    tipo_id: number
    descripcion?: string
    tipo: TipoDocumento
}
