import type { Capacidad } from '../Capacidades/types'

export type Persona = {
  id: number
  nombre: string
  apellido: string
  dni: string
  mail: string
  username: string
  operar: boolean
  administrar: boolean
  activo: boolean
  capacidades: Capacidad[]
}

export type NewPersona = {
  nombre: string
  apellido: string
  dni: string
  mail: string
  username: string
  password?: string
  operar: boolean
  administrar: boolean
}
