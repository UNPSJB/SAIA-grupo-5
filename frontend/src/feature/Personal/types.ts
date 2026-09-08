import type { Capacidad } from '../../types'

export type Persona = {
  id: number
  nombre: string
  operar: boolean
  administrar: boolean
  capacidades: Capacidad[]
}

export type NewPersona = {
  nombre: string
  operar: boolean
  administrar: boolean
}
