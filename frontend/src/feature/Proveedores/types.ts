export type Proveedor = {
    id: number;
    nombre: string;
    cuit: string;
    telefono: string | null;
    email: string | null;
    numero_habilitacion: string | null;
    vencimiento_habilitacion: string | null;
    observacion_habilitacion: string | null;
    archivo_adjunto: string | null;
    activo: boolean;
};

export type NewProveedor = {
    nombre: string;
    cuit: string;
    telefono: string | null;
    email: string | null;
};

export type RenovarHabilitacionProveedor = {
    numero_habilitacion: string;
    vencimiento_habilitacion: string;
    observacion_habilitacion: string | null;
    archivo_adjunto: string | null;
};