import type { InformacionNutricional } from "./types";

export type CampoNutricional = Exclude<keyof InformacionNutricional, "peso_unidad">;

export const CAMPOS_NUTRICIONALES: { campo: CampoNutricional; etiqueta: string; unidad: string }[] = [
    { campo: "valor_energetico", etiqueta: "Valor energético", unidad: "kcal" },
    { campo: "azucares_anadidos", etiqueta: "Azúcares añadidos", unidad: "g" },
    { campo: "grasas_totales", etiqueta: "Grasas totales", unidad: "g" },
    { campo: "grasas_saturadas", etiqueta: "Grasas saturadas", unidad: "g" },
    { campo: "sodio", etiqueta: "Sodio", unidad: "mg" },
];
