import type { UnidadMedida } from "../UnidadMedida/types"

export type InformacionNutricional = {
    valor_energetico: number | null;
    azucares_anadidos: number | null;
    grasas_totales: number | null;
    grasas_saturadas: number | null;
    sodio: number | null;
    peso_unidad: number | null;
}

export type Insumo = {
    id: number;
    nombre: string;
    unidad_medida_id: number;
    unidad_medida: UnidadMedida;
    activo: boolean;
} & InformacionNutricional

export type NewInsumo = {
    nombre: string;
    unidad_medida_id: number;
} & Partial<InformacionNutricional>
