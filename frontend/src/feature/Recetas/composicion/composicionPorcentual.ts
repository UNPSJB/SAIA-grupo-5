import type { MasaVolumen, UnidadMedida } from "../../UnidadMedida/types";
import type { TipoRenglon } from "../types";

// No hay en el proyecto un parámetro de redondeo configurable para rotulado,
// así que se fija acá en 2 decimales (con 1, insumos en cantidades muy chicas como un conservante quedaban en 0%).
export const DECIMALES_COMPOSICION = 2;

export const MOTIVO_UNIDAD_NO_RECONOCIDA = "unidad no reconocida";
export const MOTIVO_OTRA_UNIDAD_MEDIDA_ESTANDAR = "unidad de medida estándar distinta al resto, no se puede sumar";

export type RenglonReceta = {
    insumoId: number;
    nombre: string;
    tipo: TipoRenglon;
    cantidad: number;
    unidadMedida: Pick<UnidadMedida, "id">;
};

export type ItemComposicion = {
    insumoId: number;
    nombre: string;
    tipo: TipoRenglon;
    porcentaje: number;
};

export type RenglonExcluido = {
    insumoId: number;
    nombre: string;
    motivo: string;
};

export type ComposicionPorcentual = {
    // null solo si ningún renglón es convertible (no hay nada que sumar).
    unidadMedidaEstandarBase: MasaVolumen | null;
    items: ItemComposicion[];
    excluidos: RenglonExcluido[];
    sumaPorcentajes: number;
};

type UnidadConvertible = UnidadMedida & { masa_volumen: MasaVolumen; factor_a_base: number };

const esConvertible = (unidad: UnidadMedida | undefined): unidad is UnidadConvertible =>
    unidad !== undefined && unidad.masa_volumen !== null && unidad.factor_a_base !== null;

const redondear = (valor: number) => {
    const factor = 10 ** DECIMALES_COMPOSICION;
    return Math.round(valor * factor) / factor;
};

/**
 * Calcula el porcentaje de cada renglón sobre el total de la receta. El total es la
 * suma de las cantidades de los insumos convertidas a la unidad base de su unidad de medida estándar.
 * Ingredientes y aditivos comparten un único 100%.
 * El resultado es derivado: no se persiste.
 */
export function calcularComposicionPorcentual(
    renglones: RenglonReceta[],
    unidades: UnidadMedida[],
): ComposicionPorcentual {
    const catalogo = new Map(unidades.map((unidad) => [unidad.id, unidad]));
    const unidadDe = (renglon: RenglonReceta) => {
        const unidad = catalogo.get(renglon.unidadMedida.id);
        return esConvertible(unidad) ? unidad : undefined;
    };

    // TODO: ASUNCIÓN A CONFIRMAR con el equipo/cátedra. Sumar masa con volumen no es
    // válido sin densidad, que este diseño no contempla. Regla provisoria: la "unidad de medida
    // estándar base" de la receta es la de la mayoría de los renglones convertibles (empate →
    // la del primer renglón convertible). Los renglones de otra unidad de medida estándar, o con una
    // unidad fuera del catálogo estándar (ej. "Unidad", "Docena"), quedan excluidos
    // del total y se informan aparte, sin bloquear el resto de la composición.
    const conteo = new Map<MasaVolumen, number>();
    let primeraUnidadMedidaEstandar: MasaVolumen | null = null;
    for (const renglon of renglones) {
        const unidad = unidadDe(renglon);
        if (!unidad) continue;
        primeraUnidadMedidaEstandar ??= unidad.masa_volumen;
        conteo.set(unidad.masa_volumen, (conteo.get(unidad.masa_volumen) ?? 0) + 1);
    }
    let unidadMedidaEstandarBase = primeraUnidadMedidaEstandar;
    for (const [unidadMedidaEstandar, cantidad] of conteo) {
        if (unidadMedidaEstandarBase !== null && cantidad > (conteo.get(unidadMedidaEstandarBase) ?? 0)) unidadMedidaEstandarBase = unidadMedidaEstandar;
    }

    const excluidos: RenglonExcluido[] = [];
    const incluidos: { renglon: RenglonReceta; cantidadBase: number }[] = [];
    for (const renglon of renglones) {
        const unidad = unidadDe(renglon);
        if (!unidad) {
            excluidos.push({ insumoId: renglon.insumoId, nombre: renglon.nombre, motivo: MOTIVO_UNIDAD_NO_RECONOCIDA });
        } else if (unidad.masa_volumen !== unidadMedidaEstandarBase) {
            excluidos.push({ insumoId: renglon.insumoId, nombre: renglon.nombre, motivo: MOTIVO_OTRA_UNIDAD_MEDIDA_ESTANDAR });
        } else {
            incluidos.push({ renglon, cantidadBase: renglon.cantidad * unidad.factor_a_base });
        }
    }

    const total = incluidos.reduce((acc, { cantidadBase }) => acc + cantidadBase, 0);
    const items = incluidos.map(({ renglon, cantidadBase }) => ({
        insumoId: renglon.insumoId,
        nombre: renglon.nombre,
        tipo: renglon.tipo,
        porcentaje: total > 0 ? redondear((cantidadBase / total) * 100) : 0,
    }));
    // Se suma sobre los valores ya redondeados (solo para mostrar la verificación ≈100%).
    const sumaPorcentajes = redondear(items.reduce((acc, item) => acc + item.porcentaje, 0));

    return { unidadMedidaEstandarBase, items, excluidos, sumaPorcentajes };
}
