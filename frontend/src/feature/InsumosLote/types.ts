import type { Insumo } from "../Insumos/types";

export interface LoteProveedorResumen {
    id: number;
    numero_lote: string;
    proveedor?: {
        id: number;
        nombre: string;
        cuit?: string;
    };
}

export interface ProduccionAsociada {
    id: number;
    cantidad_utilizada: number;
    lote_produccion: {
        id: number;
        fecha_produccion: string;
        estado: string;
        cantidad_producida: number;
    };
}

export interface InsumoLote {
    id: number;
    lote_proveedor_id: number;
    insumo_id: number;
    marca: string;
    cantidad: number;
    cantidad_restante: number;
    fecha_vencimiento: string; 
    costo_unitario?: number | null;
    minimo_alerta: number;
    activo: boolean;
    insumo: Insumo;
    lote_proveedor?: LoteProveedorResumen;
    producciones_asociadas?: ProduccionAsociada[];
}

export interface InsumoLoteCreate {
    insumo_id: number;
    marca: string;
    cantidad: number;
    fecha_vencimiento: string;
    costo_unitario?: number | null;
    minimo_alerta: number;
}