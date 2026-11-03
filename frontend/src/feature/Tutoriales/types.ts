import type { DriveStep } from 'driver.js';

export type Permiso = 'administrar' | 'operar';

export interface Tutorial {
    id: string;
    titulo: string;
    ruta: string;
    permiso?: Permiso;
    pasos: DriveStep[];
}