export type PasoEtapa = {
    id: number;
    etapa_id: number;
    descripcion: string;
    orden: number;
}

export type EtapaReceta = {
    id: number;
    receta_id: number;
    nombre: string;
    orden: number;
    pasos: PasoEtapa[];
}

export type Receta = {
    id: number;
    producto_id: number;
    fecha_creacion: string;
    etapas: EtapaReceta[];
}

// Para el alta de la receta completa: el orden lo da la posición en las listas
export type NewPasoEtapa = {
    descripcion: string;
}

export type NewEtapaReceta = {
    nombre: string;
    pasos: NewPasoEtapa[];
}

export type NewReceta = {
    producto_id: number;
    etapas: NewEtapaReceta[];
}
