import type { Proveedor } from "../Proveedores/types";
import type { PedidoProveedor } from "../PedidosProveedor/types";

export type EstadoLoteProveedor = 'llegada' | 'desempaque' | 'acomodado';

export type PersonaSimple = {
    id: number;
    nombre: string;
    apellido: string;
};

export type HistorialEstadoLoteProveedor = {
    id: number;
    lote_id: number;
    estado: string;
    fecha_hora: string;
    observacion: string | null;
    usuario: PersonaSimple | null;
};

export type LoteProveedor = {
    id: number;
    proveedor_id: number;
    pedido_id: number;
    numero_remito: string | null;
    fecha_recepcion: string;
    archivo_adjunto: string | null;
    estado: EstadoLoteProveedor;
    registrado_por_id: number;
    fecha_registro: string;
    activo: boolean;
    proveedor?: Proveedor;
    pedido?: PedidoProveedor | null;
    registrado_por?: PersonaSimple;
};

export type NewLoteProveedor = {
    proveedor_id: number;
    pedido_id: number;
    numero_remito: string | null;
    fecha_recepcion: string;
    archivo_adjunto: string | null;
};

export type UpdateLoteProveedor = {
    numero_remito: string | null;
    fecha_recepcion: string;
    archivo_adjunto: string | null;
};

export type AvanzarEtapaLote = {
    observacion?: string | null;
};