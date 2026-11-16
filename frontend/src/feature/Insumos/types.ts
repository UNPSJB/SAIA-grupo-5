import type { UnidadMedida } from "../UnidadMedida/types"

export type InformacionNutricional = {
    valor_energetico: number | null;
    azucares_anadidos: number | null;
    grasas_totales: number | null;
    grasas_saturadas: number | null;
    sodio: number | null;
    peso_unidad: number | null;
}

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
    activo: boolean;
} & InformacionNutricional & MarcasAporte

export type NewInsumo = {
    nombre: string;
    unidad_medida_id: number;
} & Partial<InformacionNutricional> & Partial<MarcasAporte>
