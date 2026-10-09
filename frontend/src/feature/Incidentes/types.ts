import type { Sector } from "../Sectores/types"
import type { TipoIncidente } from "../TiposIncidentes/types"

export type EstadoIncidente = 'Abierto' | 'Cerrado'; 

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

    tipo_id: number
    operario_id: number
    sector_id: number | null

    tipo: TipoIncidente
    sector: Sector | null
    operario: PersonaBasica
}

export type NewIncidente = {
    nombre: string
    descripcion: string
    foto_opcional?: string | null
    tipo_id: number
    sector_id?: number | null
}

export type EditarIncidente = {
    nombre: string;
    descripcion: string;
    foto_opcional: string | null;
};

export type NewAccionCorrectiva = {
    incidente_id: number
    descripcion: string
}

export type ReabrirIncidente = {
    motivo: string
}

export type TipoEventoHistorial = "CREADO" | "CERRADO" | "REABIERTO"

export type HistorialIncidente = {
    id: number
    incidente_id: number
    tipo_evento: TipoEventoHistorial
    fecha_evento: string
    usuario_id: number
    descripcion: string | null
    accion_correctiva_id: number | null
}