import { Button } from 'react-bootstrap';

import type { TareaOcurrencia } from '../../TareasOcurrencias/types';
import { ESTADO_HISTORIAL_ESTILOS } from '../../Historial/types';
import { EstadoBadge } from '../../../components/EstadoBadge';
import { useAuth } from '../../../hooks';

interface TareaMovilProps {
    tarea: TareaOcurrencia;
    onCompletar: (tarea: TareaOcurrencia) => void;
}

export function TareaMovil({ tarea, onCompletar }: TareaMovilProps) {
    const { currentUser } = useAuth();

    const completada = tarea.estado === 'Completada';
    const laHizoOtro = completada && tarea.operario_id !== currentUser?.id;

    return (

        <div className="border rounded bg-white p-3 mb-2">  {/* Redondeo las esquinas para que se diferencie cuando sea version movil o escritorio*/}
            <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{/* Overflowwrap corta las palabras largas, una descripcion larga rompia todo*/}
                <div
                    style={{
                        fontWeight: 600,
                        textDecoration: completada ? 'line-through' : 'none',
                    }}
                >
                    {tarea.tarea_nombre_snap}
                </div>
                {tarea.tarea_descripcion_snap && (
                    <div className="text-muted small">{tarea.tarea_descripcion_snap}</div>
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
                    {tarea.plan_nombre_snap}
                </div>
                <EstadoBadge
                    tono={ESTADO_HISTORIAL_ESTILOS[completada ? 'Completada' : 'Pendiente'].tono}
                    icono={ESTADO_HISTORIAL_ESTILOS[completada ? 'Completada' : 'Pendiente'].icono}
                >
                    {completada ? 'Realizada' : 'Pendiente'}
                </EstadoBadge>
            </div>

            {/* Boton con tamaño comodo para el dedo y que no se achique mas */}
            <Button
                variant={completada ? "outline-info" : "outline-success"}
                className="w-100 mt-3"
                style={{ minHeight: 44 }}
                disabled={laHizoOtro}
                onClick={() => onCompletar(tarea)}
            >
                {completada ? (<><i className="bi bi-pencil me-1"></i>{laHizoOtro ? 'Completada por otro usuario' : 'Editar'}</>) : (<><i className="bi bi-check2-circle me-1"></i>Marcar realizada</>)}
            </Button>
        </div>
    );
}