import type { Sector } from "../Sectores/types";

export type Equipo = {
    id: number
    nombre: string
    categoria: string
    ubicacion: string
    estado: boolean
    sector: Sector | null
    plan_limpieza_id: number | null
    plan_limpieza: { id: number; nombre: string } | null
}

export type NewEquipo = {
    nombre: string
    categoria: string
    ubicacion: string
    sector_id: number | null
    plan_limpieza_id: number | null
}
