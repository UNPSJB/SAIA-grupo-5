import type { TipoDocumento } from "../TiposDocumentos/types"

export type Documento = {
    id: number
    nombre: string
    descripcion: string
    activo: boolean
    tipo_id: number
    tipo: TipoDocumento
}

export type NewDocumento = {
    nombre: string
    descripcion?: string
    tipo_id: number
}
