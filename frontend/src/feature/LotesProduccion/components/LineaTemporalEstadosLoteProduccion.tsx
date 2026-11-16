import { Card, Spinner } from 'react-bootstrap';
import { useApi } from '../../../hooks/useApi';
import { Stepper, type ItemStepper } from '../../../components/Stepper';
import type { LoteProduccion, HistorialEstadoLote } from '../types';

const PASOS_FIJOS = [
    "En produccion",
    "Empaquetando",
    "Terminado",
    "Parcialmente despachado",
    "Enviado"
];

const INDICE_ESTADO: Record<string, number> = {
    "En produccion": 0,
    "Empaquetando": 1,
    "Terminado": 2,
    "Parcialmente despachado": 3,
    "Enviado": 4
};

export function LineaTemporalEstadosLoteProduccion({ lote }: { lote: LoteProduccion }) {
    const { data: historial, isLoading } = useApi<HistorialEstadoLote[]>(`/lotes-produccion/${lote.id}/historial-estados`);

    const pasoActual = INDICE_ESTADO[lote.estado] ?? 0;

    const itemsHorizontal: ItemStepper[] = PASOS_FIJOS.map((paso) => {
        const hito = historial?.find(h => h.estado === paso);
        const fecha = hito?.fecha_hora ? new Date(hito.fecha_hora).toLocaleDateString("es-AR") : null;

        return {
            titulo: paso,
            subtitulo: fecha
        };
    });

    const itemsVertical: ItemStepper[] = (historial ?? []).map((h) => {
        const fechaObj = new Date(h.fecha_hora);
        const fechaStr = fechaObj.toLocaleDateString("es-AR");
        const horaStr = fechaObj.toLocaleTimeString("es-AR").slice(0, 5);

        return {
            titulo: h.estado,
            subtitulo: `${fechaStr} a las ${horaStr} hs`,
            observacion: h.observacion,
            autor: h.usuario ? `${h.usuario.nombre} ${h.usuario.apellido}` : 'Usuario'
        };
    });

    return (
        <Card className="shadow-sm border-0 mb-4 rounded-3 text-start">
            <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Linea de Tiempo del Lote</h5>

                <Stepper items={itemsHorizontal} pasoActual={pasoActual} direction="horizontal" />

                <hr className="my-4" />

                <h6 className="fw-bold mb-3">Historial de cambios y observaciones</h6>

                {isLoading ? (
                    <div className="text-muted d-flex align-items-center gap-2">
                        <Spinner animation="border" size="sm" /> Cargando historial...
                    </div>
                ) : itemsVertical.length === 0 ? (
                    <p className="text-muted small mb-0">No hay cambios de estado registrados aun.</p>
                ) : (
                    <Stepper items={itemsVertical} direction="vertical" />
                )}
            </Card.Body>
        </Card>
    );
}