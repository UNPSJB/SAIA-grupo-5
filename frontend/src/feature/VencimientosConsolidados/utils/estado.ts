import type { ConditionalStyles } from "react-data-table-component"
import { ESTADO_VENCIMIENTOS_ESTILOS, ESTADO_VENCIMIENTOS_ORDEN } from "../../VencimientoPersonal/types"
import type { EstadoVencimientos } from "../../VencimientoPersonal/types"

export type { EstadoVencimientos }
export { ESTADO_VENCIMIENTOS_ESTILOS, ESTADO_VENCIMIENTOS_ORDEN }

export function clasificarPorDiasRestantes(diasRestantes: number | null, diasAntelacion: number): EstadoVencimientos {
    if (diasRestantes === null) return "vigente"
    if (diasRestantes <= 0) return "vencido"
    if (diasRestantes <= diasAntelacion) return "proximo"
    return "vigente"
}

export function estilosFilaPorEstado<T>(obtenerEstado: (row: T) => EstadoVencimientos): ConditionalStyles<T>[] {
    return [
        {
            when: (row) => obtenerEstado(row) === "vencido",
            style: { backgroundColor: ESTADO_VENCIMIENTOS_ESTILOS.vencido.background },
        },
        {
            when: (row) => obtenerEstado(row) === "proximo",
            style: { backgroundColor: ESTADO_VENCIMIENTOS_ESTILOS.proximo.background },
        },
    ]
}
