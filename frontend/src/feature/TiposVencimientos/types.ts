export type TipoVencimiento = {
    id: number;
    nombre: string;
    descripcion: string | null;
    activo: boolean;
}

export type NewTipoVencimiento = {
    nombre: string;
    descripcion: string | null;
}