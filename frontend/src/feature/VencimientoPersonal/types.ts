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

// Estado derivado de un vencimiento (o del conjunto de vencimientos de una
// persona) según dias_restantes y la antelación configurada
// (ConfiguracionSistema.dias_antelacion_vencimiento).
export type EstadoVencimientos = 'vencido' | 'proximo' | 'vigente' | 'sin-vencimientos'

export const ESTADO_VENCIMIENTOS_LABELS: Record<EstadoVencimientos, string> = {
    vencido: 'Vencido',
    proximo: 'Próximo a vencer',
    vigente: 'Vigente',
    'sin-vencimientos': 'Sin vencimientos',
}

export const ESTADO_VENCIMIENTOS_ESTILOS: Record<EstadoVencimientos, { background: string; color: string }> = {
    vencido: { background: '#fee2e2', color: '#991b1b' },
    proximo: { background: '#fef3c7', color: '#92400e' },
    vigente: { background: '#dcfce7', color: '#166534' },
    'sin-vencimientos': { background: '#e5e7eb', color: '#374151' },
}

// Para ordenar tablas por urgencia (vencido primero).
export const ESTADO_VENCIMIENTOS_ORDEN: Record<EstadoVencimientos, number> = {
    vencido: 0,
    proximo: 1,
    vigente: 2,
    'sin-vencimientos': 3,
}

export type FiltroVencimientos = 'todos' | EstadoVencimientos

export const FILTRO_VENCIMIENTOS_LABELS: Record<FiltroVencimientos, string> = {
    todos: 'Todos',
    ...ESTADO_VENCIMIENTOS_LABELS,
}

// Peor estado entre varios vencimientos (ej. todos los de una persona):
// un solo vencido alcanza para marcar a la persona como "vencido".
// "Vence hoy" (dias_restantes === 0) cuenta como vencido, no como próximo
// a vencer — mismo criterio que ya usan VencimientoPersonal/ListPage y
// VerVencimientoPersonalPage.
export function calcularEstadoVencimientos(vencimientos: VencimientoPersonal[], diasAntelacion: number): EstadoVencimientos {
    if (vencimientos.length === 0) return 'sin-vencimientos'
    if (vencimientos.some((vencimiento) => vencimiento.dias_restantes <= 0)) return 'vencido'
    if (vencimientos.some((vencimiento) => vencimiento.dias_restantes <= diasAntelacion)) return 'proximo'
    return 'vigente'
}