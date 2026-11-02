import type { Producto } from "../Productos/types";

export type EstadoLote = "En produccion" | "Empaquetando" | "Terminado" | "Enviado";

export type LoteProduccion = {
    id: number;
    producto_id: number;
    producto: Producto;
    fecha_produccion: string;
    fecha_vencimiento: string;
    cantidad_producida: number;
    estado: EstadoLote;
    activo: boolean;
}

export type NewLoteProduccion = {
    producto_id: number;
    fecha_produccion: string;
    fecha_vencimiento: string;
    cantidad_producida: number;
}