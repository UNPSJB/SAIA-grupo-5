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

export interface TrazabilidadOrigenInsumo {
    insumo_lote_id: number;
    insumo_nombre: string;
    marca: string;
    numero_lote_insumo: string;
    fecha_vencimiento: string;
    cantidad_utilizada: string | number;
    unidad_medida: string;
    lote_proveedor_id?: number | null;
    numero_remito?: string | null;
    fecha_recepcion?: string | null;
    proveedor_id?: number | null;
    proveedor_nombre?: string | null;
    proveedor_cuit?: string | null;
}

export interface TrazabilidadDestinoEnvio {
    envio_id: number;
    numero_remito: string;
    fecha_envio: string;
    fecha_entrega?: string | null;
    estado: string;
    cantidad: number;
    transportista: string;
    cliente_id: number;
    cliente_razon_social: string;
    cliente_cuit: string;
    direccion: string;
}

export interface TrazabilidadLoteProduccionData {
    lote_id: number;
    producto_nombre: string;
    fecha_produccion: string;
    fecha_vencimiento: string;
    cantidad_producida: number;
    cantidad_disponible: number;
    estado: string;
    origenes: TrazabilidadOrigenInsumo[];
    destinos: TrazabilidadDestinoEnvio[];
}

export interface TrazabilidadProduccionAfectada {
    lote_produccion_id: number;
    producto_nombre: string;
    fecha_produccion: string;
    fecha_vencimiento: string;
    estado: string;
    cantidad_producida: number;
    cantidad_utilizada: string | number;
    unidad_medida: string;
    envios: TrazabilidadDestinoEnvio[];
}

export interface TrazabilidadInsumoLoteData {
    insumo_lote_id: number;
    insumo_nombre: string;
    marca: string;
    numero_lote_insumo: string;
    fecha_vencimiento: string;
    cantidad: number;
    cantidad_restante: number;
    unidad_medida: string;
    lote_proveedor_id?: number | null;
    numero_remito?: string | null;
    fecha_recepcion?: string | null;
    proveedor_id?: number | null;
    proveedor_nombre?: string | null;
    proveedor_cuit?: string | null;
    producciones: TrazabilidadProduccionAfectada[];
}

export interface TrazabilidadInsumoRecepcion {
    insumo_lote_id: number;
    insumo_nombre: string;
    marca: string;
    numero_lote_insumo: string;
    fecha_vencimiento: string;
    cantidad: number;
    cantidad_restante: number;
    unidad_medida: string;
    producciones: TrazabilidadProduccionAfectada[];
}

export interface TrazabilidadLoteProveedorData {
    lote_proveedor_id: number;
    numero_remito?: string | null;
    fecha_recepcion: string;
    estado: string;
    proveedor_id?: number | null;
    proveedor_nombre?: string | null;
    proveedor_cuit?: string | null;
    insumos: TrazabilidadInsumoRecepcion[];
}