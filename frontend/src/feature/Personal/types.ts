import type { Capacidad } from '../Capacidades/types'

export type Persona = {
  id: number
  nombre: string
  operar: boolean
  administrar: boolean
  activo: boolean
  capacidades: Capacidad[]
}

export type NewPersona = {
  nombre: string
  operar: boolean
  administrar: boolean
}
