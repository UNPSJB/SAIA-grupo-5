import type { UnidadMedida } from "../UnidadMedida/types"

export type ConsumoProducto = {
    id: number;
    tarea_id: number;
    insumo_quimico_id: number;
    cantidad_aproximada: number;
    unidad_medida_id: number;
    unidad_medida: UnidadMedida;
    insumo: InsumoResumen;
    estado: boolean;
}

export type NewConsumoProducto = {
    tarea_id: number;
    insumo_quimico_id: number;
    cantidad_aproximada: number;
    unidad_medida_id: number;
}

export type InsumoResumen = {
    id: number;
    nombre: string;
}

export type ConsumoAcumuladoProducto = {
    insumo_quimico_id: number;
    nombre: string;
    unidad_medida: string;
    acumulado: number;
}