export const Capacidades = {
  OPERAR: 'operar',
  ADMINISTRAR: 'administrar',
} as const

export type Capacidad = (typeof Capacidades)[keyof typeof Capacidades]

export interface CapacidadItem {
  id: number
  nombre: Capacidad
  descripcion: string
}
