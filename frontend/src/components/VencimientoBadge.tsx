import { calcularDiasRestantes } from '../libs/date';
import { EstadoBadge, type TonoEstado } from './EstadoBadge';

interface VencimientoBadgeProps {
    fecha: string | null | undefined;
    diasAviso?: number;
    femenino?: boolean;
    sinFecha?: string;
}

export function VencimientoBadge({ fecha, diasAviso = 30, femenino = false, sinFecha = 'Sin fecha de vencimiento' }: VencimientoBadgeProps) {
    if (!fecha) return <span className="text-muted fst-italic">{sinFecha}</span>;

    const dias = calcularDiasRestantes(fecha);
    const o = femenino ? 'a' : 'o';

    let tono: TonoEstado = 'success';
    let texto = `Vigente (${dias} días)`;
    if (dias <= 0) {
        tono = 'danger';
        texto = `Vencid${o} (${Math.abs(dias)} días)`;
    } else if (dias <= diasAviso) {
        tono = 'warning';
        texto = `Próxim${o} a vencer (${dias} días)`;
    }

    return <EstadoBadge tono={tono}>{texto}</EstadoBadge>;
}
