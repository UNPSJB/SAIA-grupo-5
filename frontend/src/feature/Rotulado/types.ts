import type { TonoEstado } from "../../components/EstadoBadge";
import type { EvaluacionSellos } from "../Recetas/types";

export type EstadoRotulado = "pendiente" | "no_corresponde" | "exceptuado" | "aplica";

export type MarcaEvaluada = {
    clave: string;
    nombre: string;
    sugerido: boolean;
    declarado: boolean | null;
    valor: boolean;
    considerada: boolean;
    insumos: string[];
}

export type EvaluacionRotulado = {
    estado: EstadoRotulado;
    mensaje: string;
    envasado_ausencia_cliente: boolean | null;
    requiere_envasado_ausencia_cliente: boolean;
    marcas: MarcaEvaluada[];
    reglas_version: number;
    sellos: EvaluacionSellos | null;
}

export type CampoDeclaracion =
    | "azucares_agregados"
    | "grasas_agregadas"
    | "sodio_agregado"
    | "contiene_edulcorantes"
    | "contiene_cafeina";

export type RotuladoProductoUpdate = Record<CampoDeclaracion, boolean | null> & {
    envasado_ausencia_cliente: boolean | null;
}

export type ReglasRotuladoBase = {
    requiere_envasado_ausencia_cliente: boolean;
    aplica_por_azucares: boolean;
    aplica_por_grasas: boolean;
    aplica_por_sodio: boolean;
    aplica_por_edulcorantes: boolean;
    aplica_por_cafeina: boolean;
    mensaje_no_corresponde: string;
    mensaje_exceptuado: string;
}

export type NewReglasRotulado = ReglasRotuladoBase & {
    observacion: string;
}

export type ReglasRotulado = NewReglasRotulado & {
    id: number;
    version: number;
    vigente: boolean;
    fecha_desde_vigencia: string;
    fecha_hasta_vigencia: string | null;
}

export const CAMPO_DECLARACION_POR_MARCA: Record<string, CampoDeclaracion> = {
    azucares: "azucares_agregados",
    grasas: "grasas_agregadas",
    sodio: "sodio_agregado",
    edulcorantes: "contiene_edulcorantes",
    cafeina: "contiene_cafeina",
};

export const REGLAS_POR_MARCA: { campo: keyof ReglasRotuladoBase; nombre: string }[] = [
    { campo: "aplica_por_azucares", nombre: "Azúcares agregados" },
    { campo: "aplica_por_grasas", nombre: "Grasas agregadas" },
    { campo: "aplica_por_sodio", nombre: "Sodio agregado" },
    { campo: "aplica_por_edulcorantes", nombre: "Edulcorantes" },
    { campo: "aplica_por_cafeina", nombre: "Cafeína" },
];

export const ESTADO_ROTULADO_ESTILOS: Record<EstadoRotulado, { tono: TonoEstado; icono: string; etiqueta: string }> = {
    pendiente: { tono: "warning", icono: "bi-question-circle-fill", etiqueta: "Falta información" },
    no_corresponde: { tono: "secondary", icono: "bi-slash-circle", etiqueta: "No corresponde" },
    exceptuado: { tono: "info", icono: "bi-shield-check", etiqueta: "Exceptuado" },
    aplica: { tono: "danger", icono: "bi-octagon-fill", etiqueta: "Alcanzado por el rotulado" },
};
