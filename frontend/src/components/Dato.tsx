import type { ReactNode } from 'react';
import { Col, type ColProps } from 'react-bootstrap';
import './Dato.css';

type Ancho = ColProps['xs'];

interface DatoProps {
    etiqueta: string;
    children: ReactNode;
    accion?: ReactNode;
    xs?: Ancho;
    sm?: Ancho;
    md?: Ancho;
    lg?: Ancho;
    xl?: Ancho;
    className?: string;
}

export function Dato({ etiqueta, children, accion, xs = 12, sm, md, lg, xl, className }: DatoProps) {
    return (
        <Col xs={xs} sm={sm} md={md} lg={lg} xl={xl} className={className}>
            <div className="dato">
                {accion ? (
                    <div className="dato-encabezado">
                        <span className="dato-etiqueta">{etiqueta}</span>
                        {accion}
                    </div>
                ) : (
                    <span className="dato-etiqueta">{etiqueta}</span>
                )}
                <div className="dato-valor">{children}</div>
            </div>
        </Col>
    );
}
