export interface DireccionCliente {
    id?: number;
    cliente_id: number;
    provincia: string;
    localidad: string;
    codigo_postal: string;
    calle_altura: string;
    descripcion?: string | null;
    activo: boolean;
}

export interface NewDireccionCliente {
    calle_altura: string;
    provincia: string;
    localidad: string;
    codigo_postal: string;
    descripcion?: string | null;
}

export interface Cliente {
    id: number;
    razon_social: string;
    cuit: string;
    telefono?: string | null;
    email?: string | null;
    activo: boolean;
    direcciones: DireccionCliente[];
}

export interface NewCliente {
    razon_social: string;
    cuit: string;
    telefono?: string | null;
    email?: string | null;
}