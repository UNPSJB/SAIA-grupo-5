import type { TipoVencimiento } from "../TiposVencimientos/types"
import type { Persona } from "../Personal/types"


export type VencimientoPersonal = {
    id: number
    persona_id: number
    tipo_vencimiento_id: number
    fecha_desde: string
    fecha_hasta: string
    observacion?: string | null;
    archivo_adjunto?: string | null;
    fecha_carga: string;
    es_actual: boolean;
    dias_restantes:number;
    persona: Persona;
    tipo_vencimiento: TipoVencimiento
}

export type NewVencimientoPersonal = {
    tipo_vencimiento_id: number;
    fecha_desde: string;
    fecha_hasta: string;
    observacion: string | null;
    archivo_adjunto?: string | null;
}