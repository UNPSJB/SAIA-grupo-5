import { ESTADO_VENCIMIENTOS_LABELS } from "../../VencimientoPersonal/types"
import { ESTADO_VENCIMIENTOS_ESTILOS, type EstadoVencimientos } from "../lib/estado"

export function EstadoVencimiento({ estado }: { estado: EstadoVencimientos }) {
    const estilo = ESTADO_VENCIMIENTOS_ESTILOS[estado]
    return (
        <div
            style={{
                padding: "4px 12px",
                borderRadius: "16px",
                background: estilo.background,
                color: estilo.color,
                fontWeight: 700,
                whiteSpace: "nowrap",
            }}
        >
            {ESTADO_VENCIMIENTOS_LABELS[estado]}
        </div>
    )
}
