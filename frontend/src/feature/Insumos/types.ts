import type { UnidadMedida } from "../UnidadMedida/types" #

export type Insumo = {
    id: number;
    nombre: string;
    unidad_medida_id: number;
    unidad_medida: UnidadMedida;
    peso_unidad: number | null;
    marca: string;
    activo: boolean;
};

export type NewInsumo = {
    nombre: string;
    unidad_medida_id: number;
    peso_unidad: number | null;
    marca: string;
};
