export type ConfiguracionSistema = {
    id: number
    dias_antelacion_vencimiento: number
    dias_antelacion_elementos: number
    hora_generacion_checklists: number
    minuto_generacion_checklists: number
}

export type ConfiguracionSistemaUpdate = {
    dias_antelacion_vencimiento: number
    dias_antelacion_elementos: number
    hora_generacion_checklists: number
    minuto_generacion_checklists: number
}
