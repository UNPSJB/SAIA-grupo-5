import type { InformacionNutricional, MarcasAporte } from "./types";

export type CampoNutricional = Exclude<keyof InformacionNutricional, "peso_unidad">;

export const CAMPOS_NUTRICIONALES: { campo: CampoNutricional; etiqueta: string; unidad: string; maximo: number }[] = [
    { campo: "valor_energetico", etiqueta: "Valor energético", unidad: "kcal", maximo: 900 },
    { campo: "azucares_anadidos", etiqueta: "Azúcares añadidos", unidad: "g", maximo: 100 },
    { campo: "grasas_totales", etiqueta: "Grasas totales", unidad: "g", maximo: 100 },
    { campo: "grasas_saturadas", etiqueta: "Grasas saturadas", unidad: "g", maximo: 100 },
    { campo: "sodio", etiqueta: "Sodio", unidad: "mg", maximo: 100000 },
];

export const MARCAS_APORTE: { campo: keyof MarcasAporte; etiqueta: string }[] = [
    { campo: "aporta_azucares", etiqueta: "Aporta azúcares agregados" },
    { campo: "aporta_grasas", etiqueta: "Aporta grasas agregadas" },
    { campo: "aporta_sodio", etiqueta: "Aporta sodio agregado" },
    { campo: "aporta_edulcorantes", etiqueta: "Es edulcorante o lo contiene" },
    { campo: "aporta_cafeina", etiqueta: "Contiene cafeína" },
];
