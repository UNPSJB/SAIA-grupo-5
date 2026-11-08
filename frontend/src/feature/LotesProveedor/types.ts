import type { Proveedor } from "../Proveedores/types";

export type EstadoLoteProveedor = 'llegada' | 'desempaque' | 'acomodado';

export type PersonaSimple = {
    id: number;
    nombre: string;
    apellido: string;
};

export type LoteProveedor = {
    id: number;
    proveedor_id: number;
    numero_lote: string;
    numero_remito: string | null;
    fecha_recepcion: string;
    archivo_adjunto: string | null;
    observaciones: string | null;
    estado: EstadoLoteProveedor;
    registrado_por_id: number;
    fecha_registro: string;
    activo: boolean;
    proveedor?: Proveedor;
    registrado_por?: PersonaSimple;
};

export type NewLoteProveedor = {
    proveedor_id: number;
    numero_lote: string;
    numero_remito: string | null;
    fecha_recepcion: string;
    archivo_adjunto: string | null;
};

export type UpdateLoteProveedor = {
    numero_lote: string;
    numero_remito: string | null;
    fecha_recepcion: string;
    archivo_adjunto: string | null;
    observaciones: string | null;
};

export type AvanzarEtapaLote = {
    observaciones?: string | null;
};