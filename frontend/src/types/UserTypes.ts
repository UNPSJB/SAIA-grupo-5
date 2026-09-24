export interface User {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    mail: string;
    username: string;
    operar: boolean;
    administrar: boolean;
    activo: boolean;
    capacidades: string[];
    role_name: string;
    role_id: number;
    email?: string;
}
