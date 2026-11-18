export type PersonaResumen = {
    id: number;
    nombre: string;
    apellido: string;
};

export type FuenteNutricional = {
    id: number;
    nombre: string;
    descripcion: string | null;
    origen: string | null;
    licencia_uso: string;
    formato_uso: string;
    licencia_verificada: boolean;
    activo: boolean;
    verificada_por_id: number | null;
    fecha_verificacion: string | null;
    verificada_por?: PersonaResumen | null;
};

export type NewFuenteNutricional = {
    nombre: string;
    descripcion: string | null;
    origen: string | null;
    licencia_uso: string;
    formato_uso: string;
    licencia_verificada: boolean;
};

export type AlimentoReferencia = {
    id: number;
    fuente_nutricional_id: number;
    codigo_externo: string | null;
    nombre: string;
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

export type ImportarCsvResultado = {
    creados: number;
    actualizados: number;
};


