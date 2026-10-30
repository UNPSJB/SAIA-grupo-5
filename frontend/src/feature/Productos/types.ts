import type { UnidadMedida } from "../UnidadMedida/types";

export type Producto = {
    id: number;
    nombre: string;
    descripcion?: string | null;
    cantidad_neta: number;
    unidad_medida_id: number;
    unidad_medida: UnidadMedida;
    foto_producto?: string | null;
    fecha_lanzamiento: string;
    activo: boolean;
}

export type NewProducto = {
    nombre: string;
    descripcion?: string | null;
    cantidad_neta: number;
    unidad_medida_id: number;
    foto_producto?: string | null;
    fecha_lanzamiento: string;
}