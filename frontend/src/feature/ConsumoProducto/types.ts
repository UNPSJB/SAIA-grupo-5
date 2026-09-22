export const UnidadMedida = {
    TONELADA: "Tonelada",
    KILOGRAMO: "Kilogramo",
    GRAMO: "Gramo",
    MILIGRAMO: "Miligramo",
    LITRO: "Litro",
    DECILITRO: "Decilitro",
    MILILITRO: "Mililitro",
    UNIDAD: "Unidad",
    DOCENA: "Docena",
} as const;

export type UnidadMedida = typeof UnidadMedida[keyof typeof UnidadMedida];

export type ConsumoProducto = {
    id: number
    tarea_id: number
    insumo_quimico_id: number
    cantidad_aproximada: number
    unidad_medida: UnidadMedida
    estado: boolean
}

export type NewConsumoProducto = {
    tarea_id: number
    insumo_quimico_id: number
    cantidad_aproximada: number
    unidad_medida: UnidadMedida
    insumo: InsumoResumen
}

export type InsumoResumen = {
    id: number
    nombre: string
}