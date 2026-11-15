import { Spinner } from 'react-bootstrap';
import type { EvaluacionSellos } from '../types';
import './SellosFrontales.css';

interface SellosFrontalesProps {
    evaluacion?: EvaluacionSellos | null;
    cargando?: boolean;
}

const PREFIJO_SELLO = "EXCESO EN ";

const formatear = (valor: number | null) => (valor ?? 0).toLocaleString('es-AR', { maximumFractionDigits: 1 });

export function SellosFrontales({ evaluacion, cargando = false }: SellosFrontalesProps) {
    const unidadBase = evaluacion?.es_liquido ? 'ml' : 'g';

    return (
        <div className="sellos-frontales">
            <div className="fw-bold mb-2">
                <i className="bi bi-octagon-fill me-2"></i>Sellos de advertencia (etiquetado frontal)
            </div>

            {cargando ? (
                <div className="d-flex align-items-center gap-2 text-muted small">
                    <Spinner animation="border" size="sm" /> Calculando sellos…
                </div>
            ) : !evaluacion?.evaluable ? (
                <p className="text-muted small mb-0">
                    Agregá ingredientes con información nutricional para estimar si el producto debería llevar sellos de advertencia.
                </p>
            ) : evaluacion.sellos.length === 0 ? (
                <p className="text-success small mb-0">
                    <i className="bi bi-check-circle-fill me-1"></i>
                    Según las cantidades de insumos alimentarios de la receta y su rendimiento, el producto <strong>no debería llevar</strong> sellos de advertencia.
                </p>
            ) : (
                <>
                    <p className="text-danger small mb-0">
                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                        Según las cantidades de insumos alimentarios de la receta y su rendimiento, el producto <strong>debería llevar {evaluacion.sellos.length === 1 ? 'el siguiente sello' : `los siguientes ${evaluacion.sellos.length} sellos`}</strong>:
                    </p>
                    <div className="sellos-frontales-lista">
                        {evaluacion.sellos.map((sello) => (
                            <div key={sello} className="sello-octogono" title={sello}>
                                <div className="sello-octogono-borde">
                                    <div className="sello-octogono-contenido">
                                        <span className="sello-octogono-exceso">{PREFIJO_SELLO.trim()}</span>
                                        <span className="sello-octogono-nutriente">{sello.replace(PREFIJO_SELLO, '')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {!cargando && evaluacion?.evaluable && (
                <p className="text-muted small mt-2 mb-0">
                    Cada 100 {unidadBase}: {formatear(evaluacion.valor_energetico)} kcal · azúcares añadidos {formatear(evaluacion.azucares_anadidos)} g · grasas totales {formatear(evaluacion.grasas_totales)} g · grasas saturadas {formatear(evaluacion.grasas_saturadas)} g · sodio {formatear(evaluacion.sodio)} mg
                </p>
            )}

            {!cargando && evaluacion && evaluacion.insumos_sin_informacion.length > 0 && (
                <p className="text-warning-emphasis small mt-2 mb-0">
                    <i className="bi bi-info-circle me-1"></i>
                    No se tuvieron en cuenta por no tener información nutricional o peso por unidad: {evaluacion.insumos_sin_informacion.join(', ')}.
                </p>
            )}
        </div>
    );
}
