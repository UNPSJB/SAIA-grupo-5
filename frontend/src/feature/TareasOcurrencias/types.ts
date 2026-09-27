
export type EstadoTareaOcurrencia = 'Pendiente' | 'Completada' | 'Cancelada'; 

export interface TareaOcurrencia {
    id: number;
    operario_id?: number | null;
    
    tarea_nombre_snap: string;
    tarea_descripcion_snap?: string | null;
    frecuencia_snap: string;
    prioridad_snap: string;
    foto_obligatoria_snap: boolean;
    accion_correctiva_snap?: string | null;
    plan_nombre_snap: string;
    
    fecha: string; 
    fecha_completado?: string | null;
    
    foto_evidencia?: string | null;
    
    fue_editada: boolean;
    fecha_edicion?: string | null;
    
    insumo_quimico_id?: number | null;
    cantidad_consumida?: number | null;

    observacion?: string | null;
    
    estado: EstadoTareaOcurrencia;
}

export interface TareaOcurrenciaCompletar {
    operario_id: number;
    foto_evidencia?: string | null;
    insumo_quimico_id?: number | null;
    cantidad_consumida?: number | null;
    observacion?: string | null;
}