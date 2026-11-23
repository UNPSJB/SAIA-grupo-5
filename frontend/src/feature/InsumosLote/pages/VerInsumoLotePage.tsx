import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { mutate } from 'swr';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import type { InsumoLote } from '../types';
import { ActionButton } from '../../../components/ActionButton';
import { ListaIncidentesVinculados } from '../../Incidentes/components/ListaIncidentesVinculados';
import { CambiarAlmacenamientoModal } from '../../Equipos/components/CambiarAlmacenamientoModal';

export function VerInsumoLotePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [mostrarModalAlmacenamiento, setMostrarModalAlmacenamiento] = useState(false);

    const { data: item, isLoading, error } = useApi<InsumoLote>(`/insumos-lote/${id}`);
    const puedeCambiarAlmacenamiento = Boolean(
        (currentUser?.operar || currentUser?.supervisor) &&
        item?.activo &&
        item?.cantidad_restante > 0
    );

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
                                <Col sm={5} className="fw-bold text-secondary">N° de Lote</Col>
                                <Col sm={7} className="fs-6 fw-bold">{item.numero_lote}</Col>
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

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Costo Unitario</Col>
                                <Col sm={7} className="fs-6">
                                    {item.costo_unitario != null
                                        ? `$${Number(item.costo_unitario).toFixed(2)}`
                                        : <span className="text-muted fst-italic">Sin costo especificado</span>}
                                </Col>
                            </Row>

                            <Row className="align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Almacenamiento</Col>
                                <Col sm={7} className="fs-6 d-flex align-items-center gap-2">
                                    {item.equipo ? (
                                        <Button
                                            variant="link"
                                            className="p-0 fw-semibold text-decoration-none"
                                            onClick={() => navigate(`/equipos/${item.equipo?.id}`)}
                                        >
                                            <i className="bi bi-thermometer-half me-1"></i>
                                            {item.equipo.nombre}
                                            {item.equipo.sector ? ` (${item.equipo.sector.nombre})` : ''}
                                        </Button>
                                    ) : item.sector ? (
                                        <span>
                                            <i className="bi bi-geo-alt me-1 text-secondary"></i>
                                            Sector: <strong>{item.sector.nombre}</strong>
                                        </span>
                                    ) : (
                                        <span className="text-muted">Sin ubicacion asignada</span>
                                    )}
                                    {puedeCambiarAlmacenamiento && (
                                        <ActionButton
                                            variant="outline-primary"
                                            size="sm"
                                            tooltip="Cambiar almacenamiento"
                                            icon="bi-pencil"
                                            onClick={() => setMostrarModalAlmacenamiento(true)}
                                        />
                                    )}
                                </Col>
                            </Row>

                            <hr className="my-4" />

                            <h5 className="mb-3">
                                <i className="bi bi-box-seam me-2"></i>Origen de Recepcion y Proveedor
                            </h5>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={5} className="fw-bold text-secondary">Recepcion / Remito</Col>
                                <Col sm={7} className="fs-6">
                                    {item.lote_proveedor ? (
                                        <Button
                                            variant="link"
                                            className="p-0 fw-bold text-decoration-none d-inline-flex align-items-center gap-1"
                                            onClick={() => navigate(`/recepciones/${item.lote_proveedor?.id}`)}
                                        >
                                            <i className="bi bi-box-arrow-up-right small"></i>
                                            {item.lote_proveedor.numero_remito
                                                ? `Remito ${item.lote_proveedor.numero_remito}`
                                                : `Recepción #${item.lote_proveedor.id}`}
                                        </Button>
                                    ) : (
                                        <span className="text-muted">Recepción #{item.lote_proveedor_id}</span>
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
                                <i className="bi bi-diagram-3 me-2"></i>Trazabilidad
                            </h5>
                            <div className="d-flex flex-wrap gap-2">
                                <Button
                                    variant="outline-primary"
                                    onClick={() => navigate(`/insumos-lote/${item.id}/producciones`)}
                                >
                                    <i className="bi bi-diagram-3 me-1"></i>Lotes de Producción Asociados
                                </Button>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => navigate(`/insumos-lote/${item.id}/trazabilidad`)}
                                >
                                    <i className="bi bi-people me-1"></i>Cadena de Trazabilidad (Clientes Alcanzados)
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    <div className="mb-4">
                        <ListaIncidentesVinculados insumoLoteId={item.id} />
                    </div>

                    <div className="d-flex justify-content-start gap-2 mb-4">
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
                    </div>
                </Col>
            </Row>

            <CambiarAlmacenamientoModal
                show={mostrarModalAlmacenamiento}
                onHide={() => setMostrarModalAlmacenamiento(false)}
                tipo="insumo_lote"
                entidadId={item.id}
                etiqueta={`${item.insumo.nombre} (${item.marca}) - Lote ${item.numero_lote}`}
                equipoActualId={item.equipo_id ?? item.equipo?.id ?? null}
                sectorActualId={item.sector_id ?? item.sector?.id ?? null}
                onActualizado={() => mutate(`/insumos-lote/${id}`)}
            />
        </Container>
    );
}