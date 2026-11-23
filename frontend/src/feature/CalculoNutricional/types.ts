export type ConfiguracionCalculo = {
    id: number;
    factor_conversion_kj: number;
    texto_no_significativo: string;
    decimales_menor_a_1: number;
    decimales_entre_1_y_10: number;
    decimales_mayor_igual_10: number;
};

export type ConfiguracionCalculoUpdate = Omit<ConfiguracionCalculo, "id">;

export type ParametroNutriente = {
    id: number;
    codigo_nutriente: string;
    nombre: string;
    unidad: string;
    valor_diario_referencia: number | null;
    declara_porcentaje_vd: boolean;
    umbral_no_significativo: number;
    orden_tabla: number;
};

export type ParametroNutrienteUpdate = Omit<ParametroNutriente, "id" | "codigo_nutriente">;

export type FilaNutrienteCalculado = {
    codigo: string;
    nombre: string;
    unidad: string;
    valor_100g_exacto: number;
    valor_100g_redondeado: number;
    texto_100g: string;
    valor_porcion_exacto: number;
    valor_porcion_redondeado: number;
    texto_porcion: string;
    porcentaje_vd: number | null;
    kj_100g: number | null;
    kj_porcion: number | null;
};

export type InformacionNutricionalReceta = {
    id: number;
    receta_id: number;
    rendimiento: number;
    porcion: number;
    tabla_nutricional: FilaNutrienteCalculado[];
    fecha_calculo: string;
};

export type TablaNutricionalRotulo = {
    receta_id: number;
    receta_version: number;
    producto: string;
    unidad: string;
    porcion: number;
    medida_casera: string | null;
    tabla_nutricional: FilaNutrienteCalculado[];
    fecha_calculo: string;
    leyenda: string;
};