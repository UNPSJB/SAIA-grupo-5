export type ConfiguracionSistema = {
    id: number
    dias_antelacion_vencimiento: number
    dias_antelacion_elementos: number
    hora_generacion_checklists: number
    minuto_generacion_checklists: number
    vista_publica_activa: boolean
    vista_publica_token: string | null
    vista_publica_nombre_establecimiento: string
    vista_publica_mostrar_cumplimiento: boolean
    vista_publica_mostrar_calibraciones: boolean
    vista_publica_mostrar_tiempo_calibracion: boolean
    vista_publica_mostrar_recambios: boolean
    vista_publica_mostrar_tiempo_recambio: boolean
    vista_publica_mostrar_planes_limpieza: boolean
}

export type ConfiguracionSistemaUpdate = {
    dias_antelacion_vencimiento: number
    dias_antelacion_elementos: number
    hora_generacion_checklists: number
    minuto_generacion_checklists: number
}
