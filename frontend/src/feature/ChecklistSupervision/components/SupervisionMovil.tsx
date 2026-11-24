import { Button } from 'react-bootstrap';
import { EstadoBadge } from '../../../components/EstadoBadge';
import { useAuth } from '../../../hooks';
import { ESTADO_HISTORIAL_ESTILOS } from '../../Historial/types';
import type { SupervisionOcurrencia } from '../types';

interface SupervisionMovilProps {
    ocurrencia: SupervisionOcurrencia;
    bloqueadoPorPasoPrevio?: boolean;
    onCompletar: (ocurrencia: SupervisionOcurrencia) => void;
    onReportarIncidente: (ocurrencia: SupervisionOcurrencia) => void;
}

export function SupervisionMovil({ ocurrencia, bloqueadoPorPasoPrevio = false, onCompletar, onReportarIncidente }: SupervisionMovilProps) {
    const { currentUser } = useAuth();
    const completada = ocurrencia.estado === 'Completada';
    const laHizoOtro = completada && ocurrencia.supervisor_id !== currentUser?.id;

    return (
        <div className="border rounded bg-white p-3 mb-2">
            <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                <div
                    style={{
                        fontWeight: 600,
                        textDecoration: completada ? 'line-through' : 'none',
                    }}
                >
                    {ocurrencia.paso_descripcion_snap}
                </div>
                <div className="text-muted small">
                    Lote #{ocurrencia.lote_produccion_id} - {ocurrencia.producto_nombre_snap} ({ocurrencia.cantidad_lote_snap})
                </div>
                {ocurrencia.observacion && (
                    <div className="text-secondary small fst-italic mt-1">
                        Observacion: {ocurrencia.observacion}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                <div
                    style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        fontWeight: 700,
                    }}
                >
                    {ocurrencia.etapa_nombre_snap}
                </div>
                <EstadoBadge
                    tono={ESTADO_HISTORIAL_ESTILOS[completada ? 'Completada' : 'Pendiente'].tono}
                    icono={ESTADO_HISTORIAL_ESTILOS[completada ? 'Completada' : 'Pendiente'].icono}
                >
                    {completada ? 'Realizada' : 'Pendiente'}
                </EstadoBadge>
            </div>

            {currentUser?.supervisor && (
                <div className="d-flex gap-2 mt-3">
                    <Button
                        variant={completada ? 'outline-info' : 'outline-success'}
                        className="flex-grow-1"
                        style={{ minHeight: 44 }}
                        disabled={laHizoOtro || bloqueadoPorPasoPrevio}
                        onClick={() => onCompletar(ocurrencia)}
                    >
                        {completada ? (
                            <>
                                <i className="bi bi-pencil me-1"></i>
                                {laHizoOtro ? 'Completada por otro supervisor' : 'Editar'}
                            </>
                        ) : bloqueadoPorPasoPrevio ? (
                            <>
                                <i className="bi bi-lock me-1"></i>Paso previo pendiente
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check2-circle me-1"></i>Marcar realizada
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline-danger"
                        style={{ minHeight: 44 }}
                        onClick={() => onReportarIncidente(ocurrencia)}
                    >
                        <i className="bi bi-exclamation-diamond"></i>
                    </Button>
                </div>
            )}
        </div>
    );
}
