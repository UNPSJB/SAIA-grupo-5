export const CLASE_AROMATIZANTE = "Aromatizante";

export type Aditivo = {
    id: number;
    clase_funcional: string;
    nombre: string;
    numero_ins: string | null;
    activo: boolean;
}

export type NewAditivo = {
    clase_funcional: string;
    nombre: string;
    numero_ins: string | null;
}

export type AditivoResumen = Omit<Aditivo, "activo">;

export const etiquetaAditivo = (aditivo: AditivoResumen) =>
    `${aditivo.clase_funcional} · ${aditivo.nombre}${aditivo.numero_ins ? ` (INS ${aditivo.numero_ins})` : ""}`;
