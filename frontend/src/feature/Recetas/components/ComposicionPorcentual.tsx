import { Alert, ListGroup, Spinner } from 'react-bootstrap';
import { useApi } from '../../../hooks/useApi';
import type { UnidadMedida } from '../../UnidadMedida/types';
import type { InsumoReceta, TipoRenglon } from '../types';
import { calcularComposicionPorcentual, type ItemComposicion } from '../lib/composicionPorcentual';

interface ComposicionPorcentualProps {
    insumos: InsumoReceta[];
}

const NOMBRE_UNIDAD_MEDIDA_ESTANDAR = { MASA: 'masa', VOLUMEN: 'volumen' } as const;

const GRUPOS: { tipo: TipoRenglon; titulo: string }[] = [
    { tipo: 'Ingrediente', titulo: 'Ingredientes' },
    { tipo: 'Aditivo', titulo: 'Aditivos' },
];

const formatear = (porcentaje: number) => `${porcentaje.toLocaleString('es-AR', { maximumFractionDigits: 1 })}%`;

export function ComposicionPorcentual({ insumos }: ComposicionPorcentualProps) {
    const { data: unidades, isLoading, error } = useApi<UnidadMedida[]>('/unidades-medida/');

    if (isLoading) {
        return (
            <div className="d-flex align-items-center gap-2 text-muted small mb-3">
                <Spinner animation="border" size="sm" /> Calculando composición…
            </div>
        );
    }
    if (error || !unidades) {
        return <p className="text-muted small text-start mb-3">No se pudo calcular la composición porcentual.</p>;
    }

    const composicion = calcularComposicionPorcentual(
        insumos.map((item) => ({
            insumoId: item.insumo_id,
            nombre: item.nombre,
            tipo: item.tipo,
            cantidad: item.cantidad,
            unidadMedida: item.unidad_medida,
        })),
        unidades,
    );

    const renderGrupo = (titulo: string, items: ItemComposicion[]) => (
        <div key={titulo} className="mb-2">
            <div className="text-muted small fw-semibold text-start mb-1">{titulo}</div>
            {items.length === 0 ? (
                <p className="text-muted small fst-italic text-start mb-0">Sin renglones incluidos en el cálculo.</p>
            ) : (
                <ListGroup>
                    {items.map((item) => (
                        <ListGroup.Item key={item.insumoId} className="d-flex justify-content-between text-start py-1">
                            <span>{item.nombre}</span>
                            <span className="fw-semibold">{formatear(item.porcentaje)}</span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );

    return (
        <section className="mb-3 text-start">
            <h6 className="fw-bold mb-1">Composición porcentual</h6>
            <p className="text-muted small mb-2">
                Sobre la suma de las cantidades de los insumos
                {composicion.unidadMedidaEstandarBase && ` (en ${NOMBRE_UNIDAD_MEDIDA_ESTANDAR[composicion.unidadMedidaEstandarBase]})`}, no sobre el rendimiento final.
            </p>

            {composicion.items.length > 0 && (
                <>
                    {GRUPOS.map(({ tipo, titulo }) =>
                        renderGrupo(titulo, composicion.items.filter((item) => item.tipo === tipo)),
                    )}
                    <div className="d-flex justify-content-between border-top pt-2 fw-bold">
                        <span>Total</span>
                        <span>{formatear(composicion.sumaPorcentajes)}</span>
                    </div>
                </>
            )}

            {composicion.excluidos.length > 0 && (
                <Alert variant="warning" className="small py-2 mt-2 mb-0">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    {composicion.items.length > 0
                        ? 'Estos insumos quedaron fuera del cálculo:'
                        : 'No se pudo calcular la composición: ningún insumo tiene una unidad convertible.'}
                    <ul className="mb-0 mt-1">
                        {composicion.excluidos.map((item) => (
                            <li key={item.insumoId}><strong>{item.nombre}</strong>: {item.motivo}</li>
                        ))}
                    </ul>
                </Alert>
            )}
        </section>
    );
}
