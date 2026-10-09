import type { Sector } from "../Sectores/types"

export type EstadoIncidente = "Abierto" | "Cerrado"

export type TipoIncidente = {
    id: number
    nombre: string
    descripcion: string | null
    activo: boolean
}

export type PersonaBasica = {
    nombre: string
    apellido: string
}

export type Incidente = {
    id: number
    nombre: string
    descripcion: string
    foto_opcional: string | null
    fecha_abierto: string
    fecha_cierre: string | null
    estado: EstadoIncidente
    activo: boolean
    operario_id: number
    operario: PersonaBasica
    tipo_id: number
    tipo: TipoIncidente
    sector_id: number | null
    sector: Sector | null
}

export type NewAccionCorrectiva = {
    incidente_id: number
    descripcion: string
}
