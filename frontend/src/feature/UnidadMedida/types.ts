export type MasaVolumen = "MASA" | "VOLUMEN";

export interface UnidadMedida{
    id: number;
    nombre: string;
    activo: boolean;
    // Unidad de medida estándar (mg, g, kg, ml, l)
    codigo: string | null;
    masa_volumen: MasaVolumen | null;
    factor_a_base: number | null;
}

export interface NewUnidadMedida{
    nombre: string;
}
