import type { Sector } from "../Sectores/types";
import type { TipoIncidente } from "../TiposIncidentes/types";
import type { TonoEstado } from "../../components/EstadoBadge";

export type EstadoIncidente = 'Abierto' | 'Cerrado';
export type EstadoSeguimientoIncidente = EstadoIncidente;

export const ESTADO_INCIDENTE_ESTILOS: Record<EstadoIncidente, { tono: TonoEstado; icono: string }> = {
    Abierto: { tono: 'warning', icono: 'bi-exclamation-circle-fill' },
    Cerrado: { tono: 'success', icono: 'bi-check-circle-fill' },
};

export const ACTIVO_ESTILOS: Record<'Activo' | 'Inactivo', { tono: TonoEstado; icono: string }> = {
    Activo: { tono: 'success', icono: 'bi-check-circle-fill' },
    Inactivo: { tono: 'danger', icono: 'bi-x-circle-fill' },
};
export type NivelDemora = 'normal' | 'demorado';

export type PersonaBasica = {
    nombre: string;
    apellido: string;
};

export type Incidente = {
    id: number;
    nombre: string;
    descripcion: string;
    foto_opcional: string | null;
    fecha_abierto: string;
    fecha_cierre: string | null;
    estado: EstadoIncidente;
    activo: boolean;
    tipo_id: number;
    operario_id: number | null;
    sector_id: number | null;
    lote_produccion_id?: number | null;
    lote_produccion?: { id: number; estado: string } | null;
    lote_proveedor_id?: number | null;
    lote_proveedor?: { id: number; numero_remito?: string | null } | null;
    insumo_lote_id?: number | null;
    insumo_lote?: { id: number; numero_lote: string; marca: string } | null;
    tipo: TipoIncidente;
    sector: Sector | null;
    operario: PersonaBasica | null;
};

export type IncidenteSeguimiento = {
    id: number;
    nombre: string;
    descripcion: string;
    estado: EstadoSeguimientoIncidente;
    fecha: string;
    fecha_abierto: string;
    fecha_cierre: string | null;
    foto_url: string | null;
    reportado_por: string;
    activo: boolean;
    tipo_id: number;
    tipo: { id: number; nombre: string };
    lote_produccion_id?: number | null;
    lote_proveedor_id?: number | null;
    insumo_lote_id?: number | null;
    dias_abierto: number;
    nivel_demora: NivelDemora;
};

export type IncidentesAbiertosPorTipo = {
    tipo_id: number;
    tipo: string;
    cantidad: number;
};

export type NewIncidente = {
    nombre: string;
    descripcion: string;
    foto_opcional?: string | null;
    tipo_id: number;
    sector_id?: number | null;
    lote_produccion_id?: number | null;
    lote_proveedor_id?: number | null;
    insumo_lote_id?: number | null;
};

export type EditarIncidente = {
    nombre: string;
    descripcion: string;
    foto_opcional: string | null;
};

export type NewAccionCorrectiva = {
    incidente_id: number
    descripcion: string
}

export type ReabrirIncidente = {
    motivo: string
}

export type TipoEventoHistorial = "CREADO" | "CERRADO" | "REABIERTO"

export type HistorialIncidente = {
    id: number
    incidente_id: number
    tipo_evento: TipoEventoHistorial
    fecha_evento: string
    usuario_id: number
    descripcion: string | null
    accion_correctiva_id: number | null
}
