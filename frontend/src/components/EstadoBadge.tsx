import type { HTMLAttributes } from 'react';

export type TonoEstado = 'success' | 'warning' | 'danger' | 'info' | 'secondary';

const COLORES_TONO: Record<TonoEstado, { background: string; color: string }> = {
    success: { background: '#dcfce7', color: '#166534' },
    warning: { background: '#fef9c3', color: '#854d0e' },
    danger: { background: '#fee2e2', color: '#991b1b' },
    info: { background: '#dbeafe', color: '#1d4ed8' },
    secondary: { background: '#f3f4f6', color: '#374151' },
};

interface EstadoBadgeProps extends HTMLAttributes<HTMLSpanElement> {
    tono: TonoEstado;
    icono?: string;
    grande?: boolean;
}

export function EstadoBadge({ tono, icono, grande = false, style, children, ...props }: EstadoBadgeProps) {
    return (
        <span
            {...props}
            style={{
                ...COLORES_TONO[tono],
                padding: grande ? '6px 16px' : '4px 12px',
                borderRadius: grande ? '20px' : '16px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
                ...style,
            }}
        >
            {icono && <i className={`bi ${icono} me-2`}></i>}
            {children}
        </span>
    );
}
