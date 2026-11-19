// El rendimiento final de la receta lo calcula el backend (suma de los insumos en gramos).
// Acá solo se formatea para mostrarlo: en kilogramos a partir de 1000 g.
export function formatearGramos(gramos: number): string {
    if (gramos >= 1000) {
        return `${(gramos / 1000).toLocaleString('es-AR', { maximumFractionDigits: 3 })} kg`;
    }
    return `${gramos.toLocaleString('es-AR', { maximumFractionDigits: 2 })} g`;
}
