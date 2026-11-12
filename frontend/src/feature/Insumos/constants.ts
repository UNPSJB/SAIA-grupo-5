import type { InformacionNutricional, MarcasAporte } from "./types";

export type CampoNutricional = Exclude<keyof InformacionNutricional, "peso_unidad">;

export const CAMPOS_NUTRICIONALES: { campo: CampoNutricional; etiqueta: string; unidad: string }[] = [
    { campo: "valor_energetico", etiqueta: "Valor energético", unidad: "kcal" },
    { campo: "azucares_anadidos", etiqueta: "Azúcares añadidos", unidad: "g" },
    { campo: "grasas_totales", etiqueta: "Grasas totales", unidad: "g" },
    { campo: "grasas_saturadas", etiqueta: "Grasas saturadas", unidad: "g" },
    { campo: "sodio", etiqueta: "Sodio", unidad: "mg" },
];

export const MARCAS_APORTE: { campo: keyof MarcasAporte; etiqueta: string }[] = [
    { campo: "aporta_azucares", etiqueta: "Aporta azúcares agregados" },
    { campo: "aporta_grasas", etiqueta: "Aporta grasas agregadas" },
    { campo: "aporta_sodio", etiqueta: "Aporta sodio agregado" },
    { campo: "aporta_edulcorantes", etiqueta: "Es edulcorante o lo contiene" },
    { campo: "aporta_cafeina", etiqueta: "Contiene cafeína" },
];
