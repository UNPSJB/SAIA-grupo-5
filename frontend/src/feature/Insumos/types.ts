export const UnidadMedida = {
    TONELADA: "t",
    KILOGRAMO: "kg",
    GRAMO: "g",
    MILIGRAMO: "mg",
    LITRO: "l",
    DECILITRO: "dl",
    MILILITRO: "ml",
    UNIDAD: "ud",
    DOCENA: "doc",
} as const;

export type UnidadMedida = typeof UnidadMedida[keyof typeof UnidadMedida];

export type Insumo = {
    id: number
    nombre: string
    unidad_medida: UnidadMedida
}