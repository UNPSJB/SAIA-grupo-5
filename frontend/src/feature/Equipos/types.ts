import type { Sector } from "../Sectores/types";

export type Equipo = {
    id: number
    nombre: string
    categoria: string
    ubicacion: string
    estado: boolean
    sector: Sector
}

export type NewEquipo = {
    nombre: string
    categoria: string
    ubicacion: string
}
