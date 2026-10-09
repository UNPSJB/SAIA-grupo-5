export type NivelDemora = 'normal' | 'demorado';
export type EstadoIncidente = 'abierto' | 'cerrado';

export type Incidente = {
    id: number;
    nombre: string;
    descripcion: string;
    estado: EstadoIncidente;
    fecha: string;
    fecha_abierto: string;
    fecha_cierre: string | null;
    foto_url: string | null;
    reportado_por: string;
    activo: boolean;
    tipo_id: number;
    tipo: { id: number; nombre: string };
    dias_abierto: number;
    nivel_demora: NivelDemora;
};

export type IncidentesAbiertosPorTipo = {
    tipo_id: number;
    tipo: string;
    cantidad: number;
};
