import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import type { EnvioLote } from '../types';

interface DetalleEnvioModalProps {
    envio: EnvioLote | null;
    onHide: () => void;
}

const BADGES_ENVIO: Record<string, string> = {
    "En camino": "warning",
    "Entregado": "success",
    "Rechazado": "danger",
};

export function VerEnvioLoteModal({ envio, onHide }: DetalleEnvioModalProps) {
    if (!envio) return null;

    const formatearFecha = (f?: string | null) => f ? f.split("-").reverse().join("/") : "-";

    return (
        <Modal show={!!envio} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title className="fs-5">
                    Detalle de Envío - Remito <span className="font-monospace">{envio.numero_remito}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Row className="mb-2">
                    <Col sm={5} className="fw-bold text-secondary">Estado:</Col>
                    <Col sm={7}>
                        <Badge bg={BADGES_ENVIO[envio.estado] || "secondary"}>
                            {envio.estado}
                        </Badge>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col sm={5} className="fw-bold text-secondary">Cliente:</Col>
                    <Col sm={7} className="fw-semibold">{envio.cliente.razon_social}</Col>
                </Row>
                <Row className="mb-2">
                    <Col sm={5} className="fw-bold text-secondary">Dirección de Entrega:</Col>
                    <Col sm={7}>
                        {envio.direccion ? `${envio.direccion.calle_altura}, ${envio.direccion.localidad}` : "-"}
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col sm={5} className="fw-bold text-secondary">Cantidad Enviada:</Col>
                    <Col sm={7}>{envio.cantidad} unidades</Col>
                </Row>
                <Row className="mb-2">
                    <Col sm={5} className="fw-bold text-secondary">Transportista:</Col>
                    <Col sm={7}>{envio.transportista}</Col>
                </Row>
                <Row className="mb-2">
                    <Col sm={5} className="fw-bold text-secondary">Fecha de Despacho:</Col>
                    <Col sm={7}>{formatearFecha(envio.fecha_envio)}</Col>
                </Row>
                <Row className="mb-2">
                    <Col sm={5} className="fw-bold text-secondary">Fecha de Entrega/Rechazo:</Col>
                    <Col sm={7}>{formatearFecha(envio.fecha_entrega)}</Col>
                </Row>

                <hr className="my-3" />

                <div className="text-start">
                    <div className="fw-bold text-secondary mb-1">Observaciones / Motivo:</div>
                    <div 
                        className="p-2 border rounded bg-light text-muted"
                        style={{ minHeight: "60px", whiteSpace: "pre-wrap" }}
                    >
                        {envio.observaciones ? envio.observaciones : <em>Sin observaciones registradas.</em>}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="justify-content-start">
                <Button variant="secondary" size="sm" onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}