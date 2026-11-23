import { Alert, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Dato } from '../../../components/Dato';
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
            <PageHeader title="Detalle del Paso de Supervisión" />

            <Card className="shadow-sm border-0 rounded-3 mb-4 mt-3 text-start">
                <Card.Body className="p-4">
                    <h6 className="detalle-seccion-titulo">Lote supervisado</h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta="Lote de Producción" md={6} lg={3}>
                            <Button
                                variant="link"
                                className="p-0 fw-bold text-decoration-none"
                                onClick={() => navigate(`/lotes-produccion/${ocurrencia.lote_produccion_id}`)}
                            >
                                <i className="bi bi-box-arrow-up-right me-1"></i>
                                Lote #{ocurrencia.lote_produccion_id}
                            </Button>
                        </Dato>
                        <Dato etiqueta="Producto y Cantidad" md={6} lg={3}>
                            <strong>{ocurrencia.producto_nombre_snap}</strong> ({ocurrencia.cantidad_lote_snap})
                        </Dato>
                        <Dato etiqueta="Fase del Lote" md={6} lg={3}>
                            <EstadoBadge tono={ocurrencia.fase_lote_snap === 'En produccion' ? 'warning' : 'info'}>
                                {ocurrencia.fase_lote_snap}
                            </EstadoBadge>
                        </Dato>
                        <Dato etiqueta="Receta (Snapshot)" md={6} lg={3}>
                            {ocurrencia.receta_version_snap
                                ? `Versión v${ocurrencia.receta_version_snap}`
                                : 'Verificación estándar de empaquetado'}
                        </Dato>
                    </Row>

                    <h6 className="detalle-seccion-titulo">Paso supervisado</h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta="Etapa" md={6} lg={4}>
                            <span className="fw-semibold">{ocurrencia.etapa_orden_snap}. {ocurrencia.etapa_nombre_snap}</span>
                        </Dato>
                        <Dato etiqueta="Paso" md={6} lg={5}>
                            {ocurrencia.paso_orden_snap}. {ocurrencia.paso_descripcion_snap}
                        </Dato>
                        <Dato etiqueta="Estado" md={6} lg={3}>
                            <EstadoBadge
                                tono={ESTADO_HISTORIAL_ESTILOS[claveEstado].tono}
                                icono={ESTADO_HISTORIAL_ESTILOS[claveEstado].icono}
                            >
                                {ocurrencia.estado}
                            </EstadoBadge>
                        </Dato>
                    </Row>

                    <h6 className="detalle-seccion-titulo">Auditoría de la supervisión</h6>
                    <Row className="g-3">
                        <Dato etiqueta="Supervisado por" md={6} lg={4}>
                            {ocurrencia.supervisor_id && ocurrencia.supervisor
                                ? `${ocurrencia.supervisor.nombre}, ${ocurrencia.supervisor.apellido}`
                                : <span className="text-muted fst-italic">Pendiente</span>}
                        </Dato>
                        <Dato etiqueta="Fecha de Completado" md={6} lg={4}>
                            {ocurrencia.fecha_completado
                                ? new Date(ocurrencia.fecha_completado).toLocaleString('es-AR')
                                : <span className="text-muted fst-italic">-</span>}
                        </Dato>
                        <Dato etiqueta="Editada" md={6} lg={4}>
                            {ocurrencia.fue_editada ? (
                                <span className="text-warning-emphasis fw-semibold">
                                    Sí (última edición:{' '}
                                    {ocurrencia.fecha_edicion
                                        ? new Date(ocurrencia.fecha_edicion).toLocaleString('es-AR')
                                        : ''}
                                    )
                                </span>
                            ) : (
                                <span>No</span>
                            )}
                        </Dato>
                        <Dato etiqueta="Observaciones">
                            {ocurrencia.observacion || <span className="text-muted fst-italic">Sin observaciones</span>}
                        </Dato>
                    </Row>
                </Card.Body>
            </Card>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
                <Button variant="outline-secondary" onClick={() => navigate('/historial-supervision')}>
                    <i className="bi bi-arrow-left me-1"></i>Volver al Historial
                </Button>
            </div>
        </Container>
    );
}
