import type { Cliente } from "../Clientes/types";
import type { DireccionCliente } from "../Clientes/types";

export type EstadoEnvio = "En camino" | "Entregado" | "Rechazado";

export type EnvioLote = {
    id: number;
    lote_id: number;
    cliente_id: number;
    direccion_cliente_id: number;
    cantidad: number;
    numero_remito: string;
    transportista: string;
    fecha_envio: string;
    fecha_entrega?: string | null;
    observaciones?: string | null;
    estado: EstadoEnvio;
    cliente: Cliente;
    direccion: DireccionCliente;
};


export type EnvioLoteCreate = {
    lote_id: number;
    cliente_id: number;
    direccion_cliente_id: number;
    cantidad: number;
    numero_remito: string;
    transportista: string;
    fecha_envio: string;
};

export type EnvioLoteUpdate = {
    recibido: boolean;
    fecha_entrega: string;
    observaciones?: string | null;
};