import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { EstadoBadge } from '../../../components/EstadoBadge';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';
import type { SupervisionOcurrencia } from '../../ChecklistSupervision/types';
import { ESTADO_HISTORIAL_ESTILOS } from '../../Historial/types';

export function VerDetalleSupervisionOcurrenciaPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: ocurrencia, isLoading, error } = useApi<SupervisionOcurrencia>(
        id ? `/supervision-lotes/${id}` : null
    );

    if (isLoading) {
        return (
            <>
                <PageHeader title="Detalle del Paso de Supervision" />
                <Spinner animation="border" role="status" className="d-block mx-auto mt-5 text-primary">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
            </>
        );
    }

    if (!ocurrencia || error) {
        return (
            <Container>
                <PageHeader title="Paso de Supervision no encontrado" />
                <Row className="justify-content-center mt-4">
                    <Col md={6}>
                        <Alert variant="danger" className="text-center shadow-sm">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error ? 'Ocurrio un error al cargar los datos.' : 'El registro de supervision no existe.'}
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    const claveEstado = ocurrencia.estado === 'Completada' ? 'Completada' : 'Pendiente';

    return (
        <Container>
            <PageHeader title="Detalle del Paso de Supervision" />

            <Row className="justify-content-center mt-3 mb-5">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Lote de Produccion</Col>
                                <Col sm={8} className="fs-6">
                                    <Button
                                        variant="link"
                                        className="p-0 fw-bold text-decoration-none"
                                        onClick={() => navigate(`/lotes-produccion/${ocurrencia.lote_produccion_id}`)}
                                    >
                                        <i className="bi bi-box-arrow-up-right me-1"></i>
                                        Lote #{ocurrencia.lote_produccion_id}
                                    </Button>
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Producto y Cantidad</Col>
                                <Col sm={8} className="fs-6">
                                    <strong>{ocurrencia.producto_nombre_snap}</strong> ({ocurrencia.cantidad_lote_snap})
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Fase del Lote</Col>
                                <Col sm={8}>
                                    <Badge bg={ocurrencia.fase_lote_snap === 'En produccion' ? 'warning' : 'info'} text="dark">
                                        {ocurrencia.fase_lote_snap}
                                    </Badge>
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Receta (Snapshot)</Col>
                                <Col sm={8}>
                                    {ocurrencia.receta_version_snap
                                        ? `Receta version v${ocurrencia.receta_version_snap}`
                                        : 'Verificacion estandar de empaquetado'}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Etapa</Col>
                                <Col sm={8} className="fs-6 fw-semibold">
                                    {ocurrencia.etapa_orden_snap}. {ocurrencia.etapa_nombre_snap}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Paso Supervisado</Col>
                                <Col sm={8}>
                                    {ocurrencia.paso_orden_snap}. {ocurrencia.paso_descripcion_snap}
                                </Col>
                            </Row>

                            <Row className="mb-4 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Estado</Col>
                                <Col sm={8}>
                                    <EstadoBadge
                                        grande
                                        tono={ESTADO_HISTORIAL_ESTILOS[claveEstado].tono}
                                        icono={ESTADO_HISTORIAL_ESTILOS[claveEstado].icono}
                                    >
                                        {ocurrencia.estado}
                                    </EstadoBadge>
                                </Col>
                            </Row>

                            <h6 className="fw-bold text-primary mb-3 mt-4">
                                <i className="bi bi-clock-history me-2"></i>Auditoria de la Supervision
                            </h6>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Supervisado por</Col>
                                <Col sm={8}>
                                    {ocurrencia.supervisor_id && ocurrencia.supervisor ? (
                                        `${ocurrencia.supervisor.nombre}, ${ocurrencia.supervisor.apellido}`
                                    ) : (
                                        <span className="text-muted fst-italic">Pendiente</span>
                                    )}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Fecha de Completado</Col>
                                <Col sm={8}>
                                    {ocurrencia.fecha_completado ? (
                                        new Date(ocurrencia.fecha_completado).toLocaleString('es-AR')
                                    ) : (
                                        <span className="text-muted fst-italic">-</span>
                                    )}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Editada</Col>
                                <Col sm={8}>
                                    {ocurrencia.fue_editada ? (
                                        <span className="text-warning fw-bold">
                                            Si (Ultima edicion:{' '}
                                            {ocurrencia.fecha_edicion
                                                ? new Date(ocurrencia.fecha_edicion).toLocaleString('es-AR')
                                                : ''}
                                            )
                                        </span>
                                    ) : (
                                        <span>No</span>
                                    )}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Observaciones</Col>
                                <Col sm={8}>
                                    {ocurrencia.observacion || (
                                        <span className="text-muted fst-italic">Sin observaciones</span>
                                    )}
                                </Col>
                            </Row>
                        </Card.Body>
                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-end gap-2">
                            <Button variant="outline-secondary" onClick={() => navigate('/historial-supervision')}>
                                <i className="bi bi-arrow-left me-1"></i>Volver al Historial
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
