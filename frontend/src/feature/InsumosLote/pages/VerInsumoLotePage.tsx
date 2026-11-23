import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { mutate } from 'swr';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { Dato } from '../../../components/Dato';
import type { InsumoLote } from '../types';
import { ActionButton } from '../../../components/ActionButton';
import { ListaIncidentesVinculados } from '../../Incidentes/components/ListaIncidentesVinculados';
import { CambiarAlmacenamientoModal } from '../../Equipos/components/CambiarAlmacenamientoModal';
import './VerInsumoLotePage.css';

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

            <Card className="shadow-sm border-0 rounded-3 mb-4 mt-3 text-start">
                <Card.Body className="p-4">
                    <h6 className="detalle-seccion-titulo">Identificación</h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta="Insumo" md={6} lg={3}>
                            <span className="fw-semibold">{item.insumo.nombre}</span>
                        </Dato>
                        <Dato etiqueta="Marca" md={6} lg={3}>{item.marca}</Dato>
                        <Dato etiqueta="N° de Lote" md={6} lg={3}>
                            <span className="fw-bold">{item.numero_lote}</span>
                        </Dato>
                        <Dato etiqueta="Unidad de Medida" md={6} lg={3}>
                            {item.insumo.unidad_medida?.nombre || 'Unidades'}
                        </Dato>
                    </Row>

                    <h6 className="detalle-seccion-titulo">Stock y vencimiento</h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta="Stock disponible / recibido" md={6} lg={3}>
                            <strong className={esBajoStock ? 'text-danger' : 'text-success'}>
                                {item.cantidad_restante}
                            </strong>{' '}
                            / {item.cantidad}
                        </Dato>
                        <Dato etiqueta="Alerta de Stock Mínimo" md={6} lg={3}>
                            {item.minimo_alerta} unidades
                        </Dato>
                        <Dato etiqueta="Fecha de Vencimiento" md={6} lg={3}>
                            {item.fecha_vencimiento.split('-').reverse().join('/')}
                        </Dato>
                        <Dato etiqueta="Estado Actual" md={6} lg={3}>
                            <span
                                style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    background: badge,
                                    color: color,
                                    fontWeight: 700,
                                    display: 'inline-block',
                                    fontSize: '0.875rem',
                                }}
                            >
                                {textoEstado}
                            </span>
                        </Dato>
                        <Dato etiqueta="Costo Unitario" md={6} lg={3}>
                            {item.costo_unitario != null
                                ? `$${Number(item.costo_unitario).toFixed(2)}`
                                : <span className="text-muted fst-italic">Sin costo especificado</span>}
                        </Dato>
                        <Dato etiqueta="Almacenamiento" md={6} lg={9}>
                            <div className="d-flex align-items-center gap-2">
                                {item.equipo ? (
                                    <Button
                                        variant="link"
                                        className="p-0 fw-semibold text-decoration-none text-start"
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
                                    <span className="text-muted">Sin ubicación asignada</span>
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
                            </div>
                        </Dato>
                    </Row>

                    <Row className="g-4">
                        <Col lg={6}>
                            <h6 className="detalle-seccion-titulo">Origen de Recepción y Proveedor</h6>
                            <Row className="g-3">
                                <Dato etiqueta="Recepción / Remito" md={6}>
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
                                </Dato>
                                <Dato etiqueta="Proveedor" md={6}>
                                    <strong>{item.lote_proveedor?.proveedor?.nombre || 'No disponible'}</strong>
                                    {item.lote_proveedor?.proveedor?.cuit && (
                                        <div className="text-muted small">CUIT: {item.lote_proveedor.proveedor.cuit}</div>
                                    )}
                                </Dato>
                            </Row>
                        </Col>
                        <Col lg={6}>
                            <h6 className="detalle-seccion-titulo">Trazabilidad</h6>
                            <div className="d-grid gap-2">
                                <Button
                                    variant="outline-primary"
                                    className="text-start"
                                    onClick={() => navigate(`/insumos-lote/${item.id}/producciones`)}
                                >
                                    <i className="bi bi-diagram-3 me-2"></i>Lotes de Producción Asociados
                                </Button>
                                <Button
                                    variant="outline-primary"
                                    className="text-start"
                                    onClick={() => navigate(`/insumos-lote/${item.id}/trazabilidad`)}
                                >
                                    <i className="bi bi-people me-2"></i>Cadena de Trazabilidad (Clientes Alcanzados)
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <div className="mb-4">
                <ListaIncidentesVinculados insumoLoteId={item.id} />
            </div>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
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
                    <i className="bi bi-box-arrow-up-right me-1"></i>Ver Recepción de Origen
                </Button>
            </div>

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