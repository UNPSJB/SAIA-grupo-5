import { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { mutate } from 'swr';
import { useApi, useAuth } from '../../../hooks';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { AvanzarEtapaLoteProveedorModal } from '../componets/AvanzarEtapaLoteProveedorModal';
import type { LoteProveedor } from '../types';

export function VerLoteProveedorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { data: lote, isLoading, error } = useApi<LoteProveedor>(`/lotes-proveedor/${id}`);
    const [modalAvanzar, setModalAvanzar] = useState(false);

    if (isLoading) return <PageLoading title="Detalle de Lote" />;
    if (!lote || error) return (
        <Container>
            <PageHeader title="Lote no encontrado" />
            <Alert variant="danger">El lote solicitado no existe o hubo un error al cargar.</Alert>
        </Container>
    );

    const PASOS = [
        { key: 'llegada', label: '1. Llegada', desc: 'Recepción y Remito' },
        { key: 'desempaque', label: '2. Desempaque', desc: 'Control de Bultos' },
        { key: 'acomodado', label: '3. Acomodado', desc: 'Almacenado Final' },
    ];

    const pasoIndex = PASOS.findIndex((p) => p.key === lote.estado);
    const esImagen = lote.archivo_adjunto?.startsWith('data:image/');

    return (
        <Container>
            <PageHeader title={`Lote ${lote.numero_lote}`} subtitle={`Proveedor: ${lote.proveedor?.nombre || 'N/A'}`} />

            {/* STEPPER DE 3 PASOS */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center position-relative">
                        {PASOS.map((paso, idx) => {
                            const completado = idx < pasoIndex;
                            const activo = idx === pasoIndex;
                            const bg = completado ? '#166534' : activo ? '#0284c7' : '#e2e8f0';
                            const color = completado || activo ? '#ffffff' : '#64748b';

                            return (
                                <div key={paso.key} className="text-center flex-fill position-relative" style={{ zIndex: 1 }}>
                                    <div
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: '50%',
                                            background: bg,
                                            color: color,
                                            margin: '0 auto 8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {completado ? <i className="bi bi-check-lg fs-5"></i> : idx + 1}
                                    </div>
                                    <div className="fw-bold">{paso.label}</div>
                                    <small className="text-muted">{paso.desc}</small>
                                </div>
                            );
                        })}
                    </div>
                </Card.Body>
            </Card>

            {/* DETALLE Y DATOS DEL LOTE */}
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Body className="p-4">
                            <h6 className="fw-bold text-secondary border-bottom pb-2 mb-3">
                                <i className="bi bi-box-seam me-2"></i>Información del Lote
                            </h6>

                            <Row className="mb-2">
                                <Col sm={4} className="fw-bold text-secondary">N° de Lote</Col>
                                <Col sm={8} className="fw-bold">{lote.numero_lote}</Col>
                            </Row>
                            <Row className="mb-2">
                                <Col sm={4} className="fw-bold text-secondary">Proveedor</Col>
                                <Col sm={8}>{lote.proveedor?.nombre} (CUIT: {lote.proveedor?.cuit})</Col>
                            </Row>
                            <Row className="mb-2">
                                <Col sm={4} className="fw-bold text-secondary">N° de Remito</Col>
                                <Col sm={8}>{lote.numero_remito || <span className="text-muted fst-italic">Sin remito</span>}</Col>
                            </Row>
                            <Row className="mb-2">
                                <Col sm={4} className="fw-bold text-secondary">Fecha de Recepción</Col>
                                <Col sm={8}>{lote.fecha_recepcion.split("-").reverse().join("/")}</Col>
                            </Row>
                            <Row className="mb-2">
                                <Col sm={4} className="fw-bold text-secondary">Registrado por</Col>
                                <Col sm={8}>
                                    {lote.registrado_por
                                        ? `${lote.registrado_por.nombre} ${lote.registrado_por.apellido}`
                                        : 'Sistema'}
                                </Col>
                            </Row>

                            {/* OBSERVACIONES DE CONTROL / DESEMPAQUE */}
                            {lote.observaciones && (
                                <div className="mt-3 p-3 bg-light rounded border">
                                    <strong className="text-secondary d-block mb-1">
                                        <i className="bi bi-card-text me-1"></i>Observaciones registradas en el flujo:
                                    </strong>
                                    <p className="mb-0 text-dark">{lote.observaciones}</p>
                                </div>
                            )}

                            {/* COMPROBANTE DE REMITO */}
                            {lote.archivo_adjunto && (
                                <div className="mt-3 pt-3 border-top">
                                    <strong className="text-secondary d-block mb-2">Comprobante de Remito:</strong>
                                    {esImagen ? (
                                        <img
                                            src={lote.archivo_adjunto}
                                            alt="Remito"
                                            style={{ maxHeight: 200, objectFit: 'contain' }}
                                            className="border rounded p-1"
                                        />
                                    ) : (
                                        <a
                                            href={lote.archivo_adjunto}
                                            download="Remito_Recepcion.pdf"
                                            className="btn btn-outline-primary btn-sm"
                                        >
                                            <i className="bi bi-file-earmark-pdf-fill text-danger me-1"></i>Descargar Remito PDF
                                        </a>
                                    )}
                                </div>
                            )}
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-between align-items-center">
                            <Button variant="outline-secondary" onClick={() => navigate('/recepciones')}>
                                <i className="bi bi-arrow-left me-1"></i>Volver al Listado
                            </Button>

                            {currentUser?.operar && lote.activo && lote.estado !== 'acomodado' && (
                                <Button variant="success" onClick={() => setModalAvanzar(true)}>
                                    <i className="bi bi-arrow-right-circle me-1"></i>
                                    Avanzar a {lote.estado === 'llegada' ? 'Desempaque' : 'Acomodado'}
                                </Button>
                            )}
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            <AvanzarEtapaLoteProveedorModal
                lote={modalAvanzar ? lote : null}
                onHide={() => setModalAvanzar(false)}
                onAvanzado={() => mutate(`/recepciones/${lote.id}`)}
            />
        </Container>
    );
}