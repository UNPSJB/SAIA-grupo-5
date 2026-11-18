import { Spinner } from 'react-bootstrap';
import { EstadoBadge } from '../../../components/EstadoBadge';
import { SellosFrontales } from '../../Recetas/components/SellosFrontales';
import { ESTADO_ROTULADO_ESTILOS, type EvaluacionRotulado } from '../types';

interface RotuladoFrontalProps {
    evaluacion?: EvaluacionRotulado | null;
    cargando?: boolean;
    onDeclarar?: () => void;
}

export function RotuladoFrontal({ evaluacion, cargando = false, onDeclarar }: RotuladoFrontalProps) {
    if (cargando || !evaluacion) {
        return (
            <div className="sellos-frontales">
                <div className="fw-bold mb-2"><i className="bi bi-tags-fill me-2"></i>Rotulado frontal</div>
                {cargando ? (
                    <div className="d-flex align-items-center gap-2 text-muted small">
                        <Spinner animation="border" size="sm" /> Evaluando el rotulado frontal…
                    </div>
                ) : (
                    <p className="text-muted small mb-0">Agregá ingredientes para evaluar el rotulado frontal del producto.</p>
                )}
            </div>
        );
    }

    const estilo = ESTADO_ROTULADO_ESTILOS[evaluacion.estado];
    const marcasActivas = evaluacion.marcas.filter((marca) => marca.valor);

    return (
        <div className="d-flex flex-column gap-2 text-start">
            <div className="sellos-frontales">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                    <span className="fw-bold"><i className="bi bi-tags-fill me-2"></i>Rotulado frontal</span>
                    <EstadoBadge tono={estilo.tono} icono={estilo.icono}>{estilo.etiqueta}</EstadoBadge>
                </div>
                <p className="small mb-2">{evaluacion.mensaje}</p>
                {evaluacion.estado !== "no_corresponde" && evaluacion.estado !== "pendiente" && (
                    <p className="text-muted small mb-0">
                        {marcasActivas.length === 0
                            ? "Sin agregados de azúcares, grasas ni sodio, ni edulcorantes o cafeína."
                            : `Marcas del producto: ${marcasActivas.map((marca) => marca.nombre.toLowerCase()).join(", ")}.`}
                    </p>
                )}
                {onDeclarar && (
                    <button type="button" className="btn btn-link btn-sm px-0 mt-1" onClick={onDeclarar}>
                        <i className="bi bi-pencil-square me-1"></i>Indicar comercialización y agregados
                    </button>
                )}
            </div>
            {evaluacion.estado === "aplica" && <SellosFrontales evaluacion={evaluacion.sellos} />}
        </div>
    );
}
