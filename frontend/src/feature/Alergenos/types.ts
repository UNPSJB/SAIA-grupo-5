export type Alergeno = {
    id: number;
    nombre: string;
    descripcion: string | null;
    es_tacc: boolean;
    activo: boolean;
};

export type NewAlergeno = {
    nombre: string;
    descripcion: string | null;
    es_tacc: boolean;
};

export type InsumoAlergenoItem = {
    alergeno_id: number;
    es_derivado: boolean;
};

export type InsumoAlergeno = {
    id: number;
    insumo_id: number;
    alergeno_id: number;
    es_derivado: boolean;
    alergeno: Alergeno;
};

export type InsumoAlergenos = {
    insumo_id: number;
    contiene_gluten: boolean;
    alergenos: InsumoAlergeno[];
};

export type InsumoAlergenosUpdate = {
    contiene_gluten: boolean;
    alergenos: InsumoAlergenoItem[];
};

export type EstadoDeclaracion = "Sugerida por el sistema" | "Confirmada";

export type AlergenoDetectado = {
    alergeno_id: number;
    nombre: string;
    es_derivado: boolean;
    es_tacc: boolean;
};

export type ContaminacionCruzadaDetalle = {
    alergeno_id: number;
    nombre: string;
    es_derivado: boolean;
};

export type ContaminacionCruzadaItem = {
    alergeno_id: number;
    es_derivado: boolean;
};

export type DeclaracionAlergenosUpdate = {
    contaminacion_cruzada: ContaminacionCruzadaItem[];
    condiciones_conservacion: string | null;
};

export type PersonaResumen = {
    id: number;
    nombre: string;
    apellido: string;
};

export type DeclaracionAlergenos = {
    id: number;
    receta_id: number;
    alergenos_detectados: AlergenoDetectado[];
    texto_alergenos: string | null;
    contiene_gluten: boolean;
    texto_gluten: string;
    contaminacion_cruzada: ContaminacionCruzadaDetalle[];
    texto_contaminacion_cruzada: string | null;
    condiciones_conservacion: string | null;
    estado: EstadoDeclaracion;
    confirmada_por_id: number | null;
    fecha_confirmacion: string | null;
    confirmada_por: PersonaResumen | null;
};