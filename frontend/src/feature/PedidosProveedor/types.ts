import type { Proveedor } from "../Proveedores/types";
import type { Insumo } from "../Insumos/types";

export type EstadoPedidoProveedor = "pendiente" | "recibido";

export type PersonaSimple = {
    id: number;
    nombre: string;
    apellido: string;
};

export type PedidoProveedorItem = {
    id: number;
    pedido_id: number;
    insumo_id: number;
    cantidad_pedida: number;
    insumo?: Insumo;
};

export type PedidoProveedorItemCreate = {
    insumo_id: number;
    cantidad_pedida: number;
};

export type PedidoProveedor = {
    id: number;
    proveedor_id: number;
    fecha_pedido: string;
    fecha_entrega_estimada: string | null;
    observacion: string | null;
    estado: EstadoPedidoProveedor;
    activo: boolean;
    registrado_por_id: number;
    fecha_registro: string;
    proveedor?: Proveedor;
    registrado_por?: PersonaSimple;
    items: PedidoProveedorItem[];
};

export type NewPedidoProveedor = {
    proveedor_id: number;
    fecha_entrega_estimada: string | null;
    observacion: string | null;
    items: PedidoProveedorItemCreate[];
};

export type UpdatePedidoProveedor = {
    fecha_entrega_estimada: string | null;
    observacion: string | null;
    items: PedidoProveedorItemCreate[];
};