export type Notificacion = {
    id: number;
    administrador_id: number;
    clave_origen: string;
    tipo: string;
    entidad_id: number | null;
    entidad: string;
    titulo: string;
    descripcion: string;
    url: string | null;
    leida: boolean;
    resuelta: boolean;
    creada_en: string;
    resuelta_en: string | null;
};
