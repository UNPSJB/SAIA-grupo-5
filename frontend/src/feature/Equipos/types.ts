import type { Sector } from "../Sectores/types";

export type Equipo = {
    id: number;
    nombre: string;
    categoria: string;
    ubicacion: string;
    estado: boolean;
    sector: Sector;
    controla_temperatura: boolean;
    temperatura_minima: number | null;
    temperatura_maxima: number | null;
};

export type NewEquipo = {
    nombre: string;
    categoria: string;
    ubicacion: string;
    sector_id: number;
    controla_temperatura: boolean;
    temperatura_minima: number | null;
    temperatura_maxima: number | null;
};

export interface InsumoAlmacenadoResumen {
    id: number;
    insumo_nombre: string;
    marca: string;
    numero_lote: string;
    cantidad_restante: number;
    unidad_medida: string;
    fecha_vencimiento: string;
}

export interface LoteAlmacenadoResumen {
    id: number;
    producto_nombre: string;
    cantidad_disponible: number;
    estado: string;
    fecha_produccion: string;
    fecha_vencimiento: string;
}

export interface AlmacenamientoEquipoResponse {
    insumos: InsumoAlmacenadoResumen[];
    lotes_produccion: LoteAlmacenadoResumen[];
}

export interface RegistroTemperatura {
    id: number;
    equipo_id: number;
    operario_id: number;
    temperatura_registrada: number;
    fecha_hora_registro: string;
    fuera_de_rango: boolean;
    accion_tomada: string | null;
    equipo: Equipo;
    operario: {
        id: number;
        nombre: string;
        apellido: string;
    };
}

export interface RegistroTemperaturaResultado extends RegistroTemperatura {
    almacenamiento_afectado?: AlmacenamientoEquipoResponse | null;
}
