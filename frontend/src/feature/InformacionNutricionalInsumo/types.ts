import type { FuenteNutricional } from "../FuenteNutricional/types"

export type PersonaResumen = {
    id: number;
    nombre: string;
    apellido: string;
};

export type NutrientesValores = {
    valor_energetico: number | null;
    carbohidratos: number | null;
    azucares_totales: number | null;
    azucares_anadidos: number | null;
    proteinas: number | null;
    grasas_totales: number | null;
    grasas_saturadas: number | null;
    grasas_trans: number | null;
    fibra_alimentaria: number | null;
    sodio: number | null;
};

export type InfoNutricionalFormValues = NutrientesValores & {
    fuente_nutricional_id: number;
    referencia_fuente: string | null;
    modificado_respecto_fuente?: boolean;
    motivo?: string | null;
};

export type NewInfoNutricional = InfoNutricionalFormValues & {
    insumo_id?: number | null;
    aditivo_id?: number | null;
};

export type InfoNutricional = NutrientesValores & {
    id: number;
    insumo_id: number | null;
    aditivo_id: number | null;
    fuente_nutricional_id: number;
    referencia_fuente: string | null;
    cargada_por_id: number;
    fecha_carga: string;
    modificado: boolean;
    modificada_por_id: number | null;
    fecha_modificacion: string | null;
    fuente_nutricional: FuenteNutricional;
    cargada_por: PersonaResumen;
    modificada_por?: PersonaResumen | null;
};

export type HistorialNutricionalInsumo = {
    id: number;
    info_nutricional_id: number;
    dato_modificado: string;
    valor_anterior: string | null;
    valor_nuevo: string | null;
    motivo: string | null;
    modificada_por_id: number;
    modificada_por: PersonaResumen;
    fecha_modificacion: string;
};

export type DatoNutricional = keyof NutrientesValores;

export const DATOS_NUTRICIONALES_CAA: { dato: DatoNutricional; etiqueta: string; unidad: string; }[] = [
    { dato: "valor_energetico", etiqueta: "Valor energético", unidad: "kcal" },
    { dato: "carbohidratos", etiqueta: "Carbohidratos", unidad: "g" },
    { dato: "azucares_totales", etiqueta: "Azúcares totales", unidad: "g" },
    { dato: "azucares_anadidos", etiqueta: "Azúcares añadidos", unidad: "g" },
    { dato: "proteinas", etiqueta: "Proteínas", unidad: "g" },
    { dato: "grasas_totales", etiqueta: "Grasas totales", unidad: "g" },
    { dato: "grasas_saturadas", etiqueta: "Grasas saturadas", unidad: "g" },
    { dato: "grasas_trans", etiqueta: "Grasas trans", unidad: "g" },
    { dato: "fibra_alimentaria", etiqueta: "Fibra alimentaria", unidad: "g" },
    { dato: "sodio", etiqueta: "Sodio", unidad: "mg" },
];

const ETIQUETAS_HISTORIAL_EXTRA: Record<string, { etiqueta: string; unidad?: string }> = {
    fuente_nutricional_id: { etiqueta: "Fuente nutricional (ID)" },
    referencia_fuente: { etiqueta: "Referencia en la fuente" },
};

export function nutrientesATexto(origen?: Partial<NutrientesValores> | null): Record<DatoNutricional, string> {
    return Object.fromEntries(
        DATOS_NUTRICIONALES_CAA.map(({ dato }) => {
            const val = origen?.[dato];
            return [dato, val === null || val === undefined ? "" : String(val)];
        })
    ) as Record<DatoNutricional, string>;
}

export function nutrientesANumero(valores: Record<DatoNutricional, string>): NutrientesValores {
    return Object.fromEntries(
        DATOS_NUTRICIONALES_CAA.map(({ dato }) => {
            const txt = valores[dato].trim();
            return [dato, txt === "" ? null : Number(txt)];
        })
    ) as NutrientesValores;
}

export function obtenerInfoDatoHistorial(datoModificado: string): { etiqueta: string; unidad?: string } {
    const nutriente = DATOS_NUTRICIONALES_CAA.find((d) => d.dato === datoModificado);
    if (nutriente) return { etiqueta: nutriente.etiqueta, unidad: nutriente.unidad };
    return ETIQUETAS_HISTORIAL_EXTRA[datoModificado] ?? { etiqueta: datoModificado };
}

export function formatearValorHistorial(valor: string | null, unidad?: string): string {
    if (valor === null || valor === "") return "-";
    return unidad ? `${valor} ${unidad}` : valor;
}

