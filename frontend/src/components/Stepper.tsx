import React from 'react';

{/* Para implementarlo fijense como lo hice en el LineaTemporalEstadosLoteProduccion */}

export interface ItemStepper {
    titulo: string;
    subtitulo?: string | null;
    observacion?: string | null;
    autor?: string | null;
}

interface StepperProps {
    items: ItemStepper[];
    pasoActual?: number; 
    direction?: 'horizontal' | 'vertical'; 
    colorPrimario?: string;
}

export function Stepper({items, pasoActual = 0, direction = 'horizontal', colorPrimario = '#198754'}: StepperProps) {       // Por defecto si no le mandas direccion te lo pone en horizontal
    if (!items || items.length === 0) return null;

    if (direction === 'vertical') {
        return (
            <div className="ps-2">
                {items.map((item, idx) => {
                    const esUltimo = idx === items.length - 1;

                    return (
                        <div key={idx} className="d-flex position-relative pb-4">
                            {!esUltimo && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: '15px',
                                        top: '32px',
                                        bottom: '0',
                                        width: '2px',
                                        backgroundColor: colorPrimario
                                    }}
                                />
                            )}

                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: '#d1e7dd',
                                    color: '#0f5132',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginRight: '16px',
                                    zIndex: 2
                                }}
                            >
                                <i className="bi bi-check2"></i>
                            </div>

                            <div className="flex-grow-1">
                                <div className="d-flex align-items-baseline gap-2">
                                    <span className="fw-bold text-dark">{item.titulo}</span>
                                    {item.subtitulo && (
                                        <span className="text-muted small">
                                            {item.subtitulo}
                                        </span>
                                    )}
                                </div>

                                {item.observacion && (
                                    <div className="p-2 mt-1 mb-1 rounded bg-light border-start border-3 border-success small text-secondary">
                                        {item.observacion}
                                    </div>
                                )}

                                {item.autor && (
                                    <span className="text-muted" style={{ fontSize: '11px' }}>
                                        <i className="bi bi-person me-1"></i>Registrado por:{' '}
                                        <strong>{item.autor}</strong>
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    const totalPasos = items.length;
    const porcentajeProgreso = totalPasos > 1 ? Math.min(Math.max((pasoActual / (totalPasos - 1)) * 88, 0), 88): 0;

    return (
        <div className="position-relative d-flex justify-content-between align-items-start mb-5 px-3">
            <div
                style={{
                    position: 'absolute',
                    top: '18px',
                    left: '6%',
                    right: '6%',
                    height: '4px',
                    backgroundColor: '#e5e7eb',
                    zIndex: 1,
                }}
            />

            <div
                style={{
                    position: 'absolute',
                    top: '18px',
                    left: '6%',
                    width: `${porcentajeProgreso}%`,
                    height: '4px',
                    backgroundColor: colorPrimario,
                    zIndex: 2,
                    transition: 'width 0.4s ease',
                }}
            />

            {items.map((item, index) => {
                const completado = index < pasoActual;
                const esActual = index === pasoActual;

                let bgColor = '#fff';
                let borderColor = '#d1d5db';
                let textColor = '#6b7280';
                let icono = <span style={{ fontSize: '13px' }}>{index + 1}</span>;

                if (completado) {
                    bgColor = colorPrimario;
                    borderColor = colorPrimario;
                    textColor = '#fff';
                    icono = <i className="bi bi-check-lg fw-bold"></i>;
                } else if (esActual) {
                    bgColor = colorPrimario;
                    borderColor = colorPrimario;
                    textColor = '#fff';
                    icono = <i className="bi bi-geo-alt-fill"></i>;
                }

                return (
                    <div
                        key={item.titulo + index}
                        className="d-flex flex-column align-items-center text-center"
                        style={{ zIndex: 3, width: '130px' }}
                    >
                        <div
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                backgroundColor: bgColor,
                                border: `2px solid ${borderColor}`,
                                color: textColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: esActual ? `0 0 0 4px ${colorPrimario}33` : 'none',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {icono}
                        </div>
                        <span className={`small mt-2 ${esActual ? 'fw-bold text-dark' : 'text-secondary'}`}>
                            {item.titulo}
                        </span>
                        <span className="text-muted" style={{ fontSize: '11px' }}>
                            {item.subtitulo ?? '-'}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}