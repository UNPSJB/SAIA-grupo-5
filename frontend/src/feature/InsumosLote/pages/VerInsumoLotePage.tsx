import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Table } from 'react-bootstrap';
import { useApi } from '../../../hooks/useApi';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import type { InsumoLote } from '../types';
import { ActionButton } from '../../../components/ActionButton';

export function VerInsumoLotePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: item, isLoading, error } = useApi<InsumoLote>(`/insumos-lote/${id}`);

    const tituloPagina = 'Detalle de Insumo Alimenticio';

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!item || error) return (
        <Container>
            <PageHeader title="Insumo no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? 'Ocurrió un error al cargar los datos.' : 'El insumo de lote ingresado no existe.'}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const partes = item.fecha_vencimiento.split('-');
    const fechaVenc = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    fechaVenc.setHours(0, 0, 0, 0);
    const diasRestantes = Math.round((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    const vencido = diasRestantes <= 0;
    const proximo = diasRestantes > 0 && diasRestantes <= 15;
    const badge = vencido ? '#fee2e2' : proximo ? '#fef3c7' : '#dcfce7';
    const color = vencido ? '#991b1b' : proximo ? '#92400e' : '#166534';
    const textoEstado = vencido
        ? `Vencido (${Math.abs(diasRestantes)} días)`
        : proximo
        ? `Próximo a vencer (${diasRestantes} días)`
        : `Vigente (${diasRestantes} días)`;

    const esBajoStock = item.cantidad_restante <= item.minimo_alerta;

    return (
        <Container>
            <PageHeader title={tituloPagina} />

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3 mb-4">
                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Insumo</Col>
                                <Col sm={7} className="fs-6 fw-semibold">{item.insumo.nombre}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Marca</Col>
                                <Col sm={7} className="fs-6">{item.marca}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Unidad de Medida</Col>
                                <Col sm={7} className="fs-6">
                                    {item.insumo.unidad_medida?.nombre || 'Unidades'}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Stock / Cantidad Recibida</Col>
                                <Col sm={7} className="fs-6">
                                    <strong className={esBajoStock ? 'text-danger' : 'text-success'}>
                                        {item.cantidad_restante}
                                    </strong>{' '}
                                    disponibles / {item.cantidad} recibidas
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Alerta de Stock Mínimo</Col>
                                <Col sm={7} className="fs-6">{item.minimo_alerta} unidades</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Fecha de Vencimiento</Col>
                                <Col sm={7} className="fs-6">{item.fecha_vencimiento.split('-').reverse().join('/')}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Estado Actual</Col>
                                <Col sm={7}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: badge,
                                            color: color,
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {textoEstado}
                                    </div>
                                </Col>
                            </Row>

                            <Row className="align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Costo Unitario</Col>
                                <Col sm={7} className="fs-6">
                                    {item.costo_unitario != null
                                        ? `$${Number(item.costo_unitario).toFixed(2)}`
                                        : <span className="text-muted fst-italic">Sin costo especificado</span>}
                                </Col>
                            </Row>

                            <hr className="my-4" />

                            <h5 className="mb-3">
                                <i className="bi bi-box-seam me-2"></i>Origen de Recepción y Proveedor
                            </h5>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Lote de Recepcion</Col>
                                <Col sm={7} className="fs-6">
                                    {item.lote_proveedor ? (
                                        <Button
                                            variant="link"
                                            className="p-0 fw-bold text-decoration-none d-inline-flex align-items-center gap-1"
                                            onClick={() => navigate(`/recepciones/${item.lote_proveedor?.id}`)}
                                        >
                                            <i className="bi bi-box-arrow-up-right small"></i>
                                            {item.lote_proveedor.numero_lote}
                                        </Button>
                                    ) : (
                                        <span className="text-muted">ID #{item.lote_proveedor_id}</span>
                                    )}
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Proveedor</Col>
                                <Col sm={7} className="fs-6">
                                    <strong>{item.lote_proveedor?.proveedor?.nombre || 'No disponible'}</strong>
                                    {item.lote_proveedor?.proveedor?.cuit && (
                                        <span className="text-muted small ms-2">
                                            (CUIT: {item.lote_proveedor.proveedor.cuit})
                                        </span>
                                    )}
                                </Col>
                            </Row>

                            <hr className="my-4" />

                            <h5 className="mb-3">
                                <i className="bi bi-diagram-3 me-2"></i>Lotes de Produccion Asociados
                            </h5>
                            {!item.producciones_asociadas || item.producciones_asociadas.length === 0 ? (
                                <p className="text-muted mb-0">
                                    Este insumo todavia no fue utilizado en ningun lote de produccion.
                                </p>
                            ) : (
                                <Table responsive bordered hover size="sm" className="mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Lote de Produccion</th>
                                            <th>Fecha Fabricacion</th>
                                            <th>Cantidad Utilizada</th>
                                            <th>Estado del Lote</th>
                                            <th className="text-center">Accion</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {item.producciones_asociadas.map((asoc) => (
                                            <tr key={asoc.id}>
                                                <td><strong>Lote #{asoc.lote_produccion.id}</strong></td>
                                                <td>{asoc.lote_produccion.fecha_produccion.split('-').reverse().join('/')}</td>
                                                <td>
                                                    {Number(asoc.cantidad_utilizada).toLocaleString('es-AR')} {item.insumo.unidad_medida?.nombre || 'U'}
                                                </td>
                                                <td><span className="badge bg-secondary">{asoc.lote_produccion.estado}</span></td>
                                                <td className="text-center">
                                                    <ActionButton
                                                        variant="outline-info"
                                                        size="sm"
                                                        onClick={() => navigate(`/lotes-produccion/${asoc.lote_produccion.id}`)}
                                                        title="Ver lote de producción"
                                                        tooltip="Ver lote de produccion"
                                                        icon="bi bi-eye"
                                                    >
                                                    </ActionButton>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-start gap-2">
                            <Button
                                variant="outline-secondary"
                                onClick={() => navigate('/insumos-lote')}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>
                            <Button
                                variant="outline-primary"
                                onClick={() => navigate(`/recepciones/${item.lote_proveedor?.id || item.lote_proveedor_id}`)}
                            >
                                <i className="bi bi-box-arrow-up-right me-1"></i>Ver Recepcion de Origen
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}