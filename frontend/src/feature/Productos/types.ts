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
    receta?: { id: number } | null;
    codigo_producto?: string | null;
    codigo_barras: string | null;
}

export type NewProducto = {
    nombre: string;
    descripcion?: string | null;
    cantidad_neta: number;
    unidad_medida_id: number;
    codigo_producto?: string | null;
    foto_producto?: string | null;
    fecha_lanzamiento: string;
}