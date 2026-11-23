export type EstadoSupervisionOcurrencia = 'Pendiente' | 'Completada';

export interface SupervisionOcurrencia {
    id: number;
    lote_produccion_id: number;
    supervisor_id?: number | null;
    supervisor?: {
        id: number;
        nombre: string;
        apellido: string;
    } | null;
    fase_lote_snap: string;
    receta_id_origen?: number | null;
    receta_version_snap?: number | null;
    etapa_id_origen?: number | null;
    etapa_nombre_snap: string;
    etapa_orden_snap: number;
    paso_id_origen?: number | null;
    paso_descripcion_snap: string;
    paso_orden_snap: number;
    producto_nombre_snap: string;
    cantidad_lote_snap: string;
    fecha: string;
    fecha_completado?: string | null;
    fue_editada: boolean;
    fecha_edicion?: string | null;
    observacion?: string | null;
    estado: EstadoSupervisionOcurrencia;
}

export interface SupervisionOcurrenciaCompletar {
    observacion?: string | null;
}
