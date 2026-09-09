export const Capacidades = {
  OPERAR: 'operar',
  ADMINISTRAR: 'administrar',
} as const

export type Capacidad = (typeof Capacidades)[keyof typeof Capacidades]
