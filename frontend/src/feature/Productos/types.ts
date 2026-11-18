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
    envasado_ausencia_cliente?: boolean | null;
    azucares_agregados?: boolean | null;
    grasas_agregadas?: boolean | null;
    sodio_agregado?: boolean | null;
    contiene_edulcorantes?: boolean | null;
    contiene_cafeina?: boolean | null;
    receta?: { id: number } | null;
}

export type NewProducto = {
    nombre: string;
    descripcion?: string | null;
    cantidad_neta: number;
    unidad_medida_id: number;
    foto_producto?: string | null;
    fecha_lanzamiento: string;
}