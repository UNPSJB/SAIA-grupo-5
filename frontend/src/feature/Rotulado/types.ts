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

export type DatosRotuladoCAA = {
    denominacion_venta: string;
    contenido_neto: string;
    lista_ingredientes: string;
    razon_social: string;
    domicilio: string;
    numero_registro: string;
    identificacion_lote: string;
    fecha_duracion: string | null;
    instrucciones_uso: string;
    es_importado: boolean;
    importador_razon_social: string;
    importador_domicilio: string;
    importador_cuit: string;
};

export type CampoCompletitud = {
    clave: string;
    nombre: string;
    obligatorio: boolean;
    completo: boolean;
    automatico: boolean;
    referencia: string | null;
    condicional: string | null;
    valor: string;
    origen: "sistema" | "manual" | "vacio";
};

export type CambioRotulado = {
    campo: string;
    nombre_campo: string;
    valor_anterior: string | null;
    valor_nuevo: string | null;
    usuario: string | null;
    fecha_hora: string;
};

export type FilaNutricional = {
    codigo: string;
    nombre: string;
    unidad: string;
    texto_porcion: string;
    texto_100g: string;
    porcentaje_vd: number | null;
    kj_porcion?: number | null;
    kj_100g?: number | null;
};

export type BorradorRotuladoCAA = {
    producto_id: number;
    datos: DatosRotuladoCAA;
    sugeridos: Record<string, string>;
    campos: CampoCompletitud[];
    faltantes: string[];
    completitud: number;
    historial: CambioRotulado[];
    tabla_nutricional: FilaNutricional[] | null;
    sellos: string[];
    fecha_actualizacion: string | null;
};

export type ClaveElementoEmpaquetado =
    | "denominacion"
    | "contenido_neto"
    | "ingredientes"
    | "origen"
    | "lote_fecha"
    | "instrucciones"
    | "tabla_nutricional"
    | "sellos"
    | "importador";

export type ElementoEmpaquetado = {
    clave: ClaveElementoEmpaquetado;
    x: number;
    y: number;
    ancho: number;
    alto: number;
    visible: boolean;
};

export type VersionEmpaquetadoResumen = {
    id: number;
    version: number;
    vigente: boolean;
    tiene_foto: boolean;
    observacion: string | null;
    creado_por: string | null;
    fecha_desde_vigencia: string;
    fecha_hasta_vigencia: string | null;
};

export type VersionEmpaquetado = VersionEmpaquetadoResumen & {
    foto: string | null;
    elementos: ElementoEmpaquetado[];
};

export type EmpaquetadoProducto = {
    producto_id: number;
    vigente: VersionEmpaquetado | null;
    versiones: VersionEmpaquetadoResumen[];
    foto: string | null;
    elementos: ElementoEmpaquetado[];
    datos: DatosRotuladoCAA;
    tabla_nutricional: FilaNutricional[] | null;
    tabla_incompleta: boolean;
    sellos: string[];
    mensaje_sellos: string;
    leyenda: string;
    faltantes: string[];
};

export const ETIQUETAS_EMPAQUETADO: Record<ClaveElementoEmpaquetado, string> = {
    denominacion: "Denominación de venta",
    contenido_neto: "Contenido neto",
    ingredientes: "Lista de ingredientes",
    origen: "Origen con RNPA/RPPA",
    lote_fecha: "Lote y fecha de duración",
    instrucciones: "Instrucciones de uso",
    tabla_nutricional: "Tabla nutricional",
    sellos: "Octógonos / sellos",
    importador: "Importador",
};

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
