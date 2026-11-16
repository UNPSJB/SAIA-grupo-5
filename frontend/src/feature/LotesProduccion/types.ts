import type { Producto } from "../Productos/types";
import type { InsumoLote } from "../InsumosLote/types";

export type EstadoLote = "En produccion" | "Empaquetando" | "Terminado" | "Parcialmente despachado" | "Enviado";

export type InsumoUtilizado = {
    id: number;
    lote_produccion_id: number;
    insumo_lote_id: number;
    cantidad_utilizada: string;
    insumo_lote: InsumoLote;
}

export type NewInsumoUtilizado = {
    insumo_lote_id: number;
    cantidad_utilizada: string;
}

export type LoteProduccion = {
    id: number;
    producto_id: number;
    producto: Producto;
    fecha_produccion: string;
    fecha_vencimiento: string;
    cantidad_producida: number;
    cantidad_disponible: number;
    estado: EstadoLote;
    activo: boolean;
    insumos_utilizados?: InsumoUtilizado[];
}

export type NewLoteProduccion = {
    producto_id: number;
    fecha_produccion: string;
    fecha_vencimiento: string;
    cantidad_producida: number;
}

export interface HistorialEstadoLote {
    id: number;
    lote_id: number;
    estado: string;
    fecha_hora: string;
    observacion?: string | null;
    usuario: {
        id: number;
        nombre: string;
        apellido: string;
        username: string;
    };
}