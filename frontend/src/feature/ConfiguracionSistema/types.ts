export type ConfiguracionSistema = {
    id: number
    nombre_pyme: string
    logo_pyme: string | null
    telefono_pyme: string | null
    email_pyme: string | null
    direccion_pyme: string | null
    dias_antelacion_vencimiento: number
    dias_antelacion_elementos: number
    hora_generacion_checklists: number
    minuto_generacion_checklists: number
    vista_publica_activa: boolean
    vista_publica_token: string | null
    vista_publica_mostrar_cumplimiento: boolean
    vista_publica_mostrar_calibraciones: boolean
    vista_publica_mostrar_tiempo_calibracion: boolean
    vista_publica_mostrar_recambios: boolean
    vista_publica_mostrar_tiempo_recambio: boolean
    vista_publica_mostrar_planes_limpieza: boolean
    vista_publica_mostrar_tareas_realizadas: boolean
    vista_publica_mostrar_dias_limpieza: boolean
    vista_publica_mostrar_documentos_tecnicos: boolean
    vista_publica_mostrar_productos_elaborados: boolean
    vista_publica_mostrar_lotes_producidos: boolean
}

export type ConfiguracionSistemaUpdate = {
    nombre_pyme?: string
    logo_pyme?: string | null
    telefono_pyme?: string | null
    email_pyme?: string | null
    direccion_pyme?: string | null
    dias_antelacion_vencimiento?: number
    dias_antelacion_elementos?: number
    hora_generacion_checklists?: number
    minuto_generacion_checklists?: number
}
