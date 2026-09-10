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

export type Insumo = {
    id: number
    nombre: string
    unidad_medida: UnidadMedida
    activo: boolean
}

export type NewInsumo = {
    nombre: string
    unidad_medida: UnidadMedida
}