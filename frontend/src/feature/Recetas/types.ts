import type { UnidadMedida } from "../UnidadMedida/types";
import type { AditivoResumen } from "../Aditivos/types";

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

export type TipoRenglon = "Ingrediente" | "Aditivo";

export type InsumoReceta = {
    id: number;
    insumo_id: number;
    nombre: string;
    cantidad: number;
    unidad_medida: UnidadMedida;
    tipo: TipoRenglon;
    aditivo_id: number | null;
    aditivo: AditivoResumen | null;
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

export type RecetaVersion = {
    id: number;
    producto_id: number;
    version: number;
    vigente: boolean;
    fecha_creacion: string;
    fecha_desde_vigencia: string | null;
    fecha_hasta_vigencia: string | null;
}

export type Receta = RecetaVersion & {
    rendimiento: number | null;
    rendimiento_unidad_medida_id: number | null;
    rendimiento_unidad_medida: UnidadMedida | null;
    porcion: number | null;
    porcion_unidad_medida_id: number | null;
    porcion_unidad_medida: UnidadMedida | null;
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
    tipo: TipoRenglon;
    aditivo_id: number | null;
}

export type NewRecetaVersion = {
    rendimiento: number;
    rendimiento_unidad_medida_id: number;
    porcion: number | null;
    porcion_unidad_medida_id: number | null;
    etapas: NewEtapaReceta[];
    insumos: NewInsumoReceta[];
}

export type NewReceta = NewRecetaVersion & {
    producto_id: number;
}
