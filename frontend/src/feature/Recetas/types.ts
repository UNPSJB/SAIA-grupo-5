import type { UnidadMedida } from "../UnidadMedida/types";

export type PasoEtapa = {
    id: number;
    etapa_id: number;
    descripcion: string;
    orden: number;
}

export type EtapaReceta = {
    id: number;
    receta_id: number;
    nombre: string;
    orden: number;
    pasos: PasoEtapa[];
}

export type InsumoReceta = {
    id: number;
    insumo_id: number;
    nombre: string;
    cantidad: number;
    unidad_medida: UnidadMedida;
}

export type EvaluacionSellos = {
    evaluable: boolean;
    es_liquido: boolean;
    cantidad_base: number | null;
    valor_energetico: number | null;
    azucares_anadidos: number | null;
    grasas_totales: number | null;
    grasas_saturadas: number | null;
    sodio: number | null;
    sellos: string[];
    insumos_sin_informacion: string[];
}

export type Receta = {
    id: number;
    producto_id: number;
    fecha_creacion: string;
    etapas: EtapaReceta[];
    insumos: InsumoReceta[];
    sellos: EvaluacionSellos;
}

// Para el alta de la receta completa: el orden lo da la posición en las listas
export type NewPasoEtapa = {
    descripcion: string;
}

export type NewEtapaReceta = {
    nombre: string;
    pasos: NewPasoEtapa[];
}

export type NewInsumoReceta = {
    insumo_id: number;
    cantidad: number;
}

export type NewReceta = {
    producto_id: number;
    etapas: NewEtapaReceta[];
    insumos: NewInsumoReceta[];
}
