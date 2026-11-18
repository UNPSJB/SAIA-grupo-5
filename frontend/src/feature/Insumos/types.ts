import type { UnidadMedida } from "../UnidadMedida/types" #

export type MarcasAporte = {
    aporta_azucares: boolean;
    aporta_grasas: boolean;
    aporta_sodio: boolean;
    aporta_edulcorantes: boolean;
    aporta_cafeina: boolean;
}

export type Insumo = {
    id: number;
    nombre: string;
    unidad_medida_id: number;
    unidad_medida: UnidadMedida;
    peso_unidad: number | null;
    marca: string;
    activo: boolean;
} & InformacionNutricional & MarcasAporte

export type NewInsumo = {
    nombre: string;
    unidad_medida_id: number;
    peso_unidad: number | null;
    marca: string;
} & Partial<InformacionNutricional> & Partial<MarcasAporte>

