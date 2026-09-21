import type { Sector } from "../Sectores/types";

export type Equipo = {
    id: number
    nombre: string
    categoria: string
    ubicacion: string
    estado: boolean
    sector: Sector | null
}

export type NewEquipo = {
    nombre: string
    categoria: string
    ubicacion: string
    sector_id: number | null
}
