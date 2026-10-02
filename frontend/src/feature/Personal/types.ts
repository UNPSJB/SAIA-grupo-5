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

// Contrato de schemas.VencimientoPersonal (backend): todavía no implementado,
// es parte de otra historia de usuario. persona/tipo_vencimiento van
// anidados (no solo sus ids) para poder mostrar nombres sin pedidos extra.
type PersonaResumen = { id: number; nombre: string }
type TipoVencimientoResumen = { id: number; nombre: string }

export type VencimientoPersonal = {
  id: number
  persona_id: number
  persona: PersonaResumen
  tipo_vencimiento_id: number
  tipo_vencimiento: TipoVencimientoResumen
  fecha_desde: string
  fecha_hasta: string
  observacion: string | null
}
