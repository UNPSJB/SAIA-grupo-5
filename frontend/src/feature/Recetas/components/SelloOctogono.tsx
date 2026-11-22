import type { CSSProperties } from 'react';
import './SellosFrontales.css';

export const PREFIJO_SELLO = 'EXCESO EN ';

interface SelloOctogonoProps {
    sello: string;
    /** Tamaño del octógono. Si se omite se usa el tamaño por defecto (96px). */
    tamano?: number | string;
    className?: string;
}

export function SelloOctogono({ sello, tamano, className }: SelloOctogonoProps) {
    const estilo = tamano === undefined
        ? undefined
        : ({ '--sello-tamano': typeof tamano === 'number' ? `${tamano}px` : tamano } as CSSProperties);

    return (
        <div className={className ? `sello-octogono ${className}` : 'sello-octogono'} style={estilo} title={sello}>
            <div className="sello-octogono-borde">
                <div className="sello-octogono-contenido">
                    <span className="sello-octogono-exceso">{PREFIJO_SELLO.trim()}</span>
                    <span className="sello-octogono-nutriente">{sello.replace(PREFIJO_SELLO, '')}</span>
                </div>
            </div>
        </div>
    );
}
