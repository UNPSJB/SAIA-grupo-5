import type { Documento } from "../Documentos/types"

export type VersionDocumento = {
    id: number
    version: number
    vigente: boolean
    activo: boolean
    documento_id: number
    fecha_subida: string
    archivo: string
    documento: Documento
    fecha_desde_vigencia: string | null
    fecha_hasta_vigencia: string | null
}

export type NewVersionDocumento = {
    documento_id: number
    archivo: string
}
