export interface TipoQuimico {
    id: number;
    nombre: string;
    descripcion?: string;
    activo: boolean;
}

export interface NewTipoQuimico {
    nombre: string;
    descripcion?: string;
}