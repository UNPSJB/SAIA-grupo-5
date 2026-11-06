import type { Insumo, NewInsumo } from "../Insumos/types";
import type { TipoQuimico } from "../TiposQuimicos/types";

export interface InsumoQuimico extends Insumo {
    tipo_quimico_id: number;
    tipo: TipoQuimico;
    dilucion: string;
}

export interface NewInsumoQuimico extends NewInsumo {
    tipo_quimico_id: number;
    dilucion: string;
}