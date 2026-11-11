import { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Table, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { mutate } from 'swr';
import { useApi, useAuth } from '../../../hooks';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { Stepper, type ItemStepper } from '../../../components/Stepper';
import { AvanzarEtapaLoteProveedorModal } from '../componets/AvanzarEtapaLoteProveedorModal';
import type { LoteProveedor, EstadoLoteProveedor, HistorialEstadoLoteProveedor } from '../types';
import type { InsumoLote } from '../../InsumosLote/types';
import { AgregarInsumoLoteModal } from '../../InsumosLote/components/AgregarInsumoLoteModal';
import { DeleteInsumoLoteModal } from '../../InsumosLote/components/DeleteInsumoLoteModal';
import { ActionButton } from '../../../components/ActionButton';

const PASOS_FIJOS = ["Llegada", "Desempaque", "Acomodado"];

const INDICE_ESTADO: Record<EstadoLoteProveedor, number> = {
    llegada: 0,
    desempaque: 1,
    acomodado: 2,
};

const ESTILOS_ETAPA: Record<EstadoLoteProveedor, { label: string; bg: string; color: string }> = {
    llegada: { label: "Llegada", bg: "#e0f2fe", color: "#0369a1" },
    desempaque: { label: "Desempaque", bg: "#fef3c7", color: "#92400e" },
    acomodado: { label: "Acomodado", bg: "#dcfce7", color: "#166534" },
};

export function VerLoteProveedorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const { data: lote, isLoading, error } = useApi<LoteProveedor>(`/lotes-proveedor/${id}`);
    const { data: historial, isLoading: cargandoHistorial } = useApi<HistorialEstadoLoteProveedor[]>(id ? `/lotes-proveedor/${id}/historial-estados` : null);
    const { data: insumosLote, isLoading: cargandoInsumos } = useApi<InsumoLote[]>(id ? `/insumos-lote/lote/${id}` : null);

    const [modalAvanzar, setModalAvanzar] = useState(false);
    const [modalAgregarInsumo, setModalAgregarInsumo] = useState(false);
    const [insumoAEliminar, setInsumoAEliminar] = useState<InsumoLote | null>(null);

    if (isLoading) return <PageLoading title="Detalle de Lote" />;
    if (!lote || error) return (
        <Container>
            <PageHeader title="Lote no encontrado" />
            <Alert variant="danger">El lote solicitado no existe o hubo un error al cargar.</Alert>
        </Container>
    );

    const pasoActual = INDICE_ESTADO[lote.estado] ?? 0;
    const esImagen = lote.archivo_adjunto?.startsWith('data:image/');
    const confEtapa = ESTILOS_ETAPA[lote.estado] || { label: lote.estado, bg: '#f1f5f9', color: '#475569' };

    const itemsHorizontal: ItemStepper[] = PASOS_FIJOS.map((paso) => {
        const hito = historial?.find((h) => h.estado.toLowerCase() === paso.toLowerCase());
        const fecha = hito?.fecha_hora ? new Date(hito.fecha_hora).toLocaleDateString("es-AR") : null;
        return {
            titulo: paso,
            subtitulo: fecha,
        };
    });

    const itemsVertical: ItemStepper[] = (historial ?? []).map((h) => {
        const fechaObj = new Date(h.fecha_hora);
        const fechaStr = fechaObj.toLocaleDateString("es-AR");
        const horaStr = fechaObj.toLocaleTimeString("es-AR").slice(0, 5);

        return {
            titulo: h.estado === "Llegada" ? "Llegada / Recepcion" : h.estado,
            subtitulo: `${fechaStr} a las ${horaStr} hs`,
            observacion: h.observacion || "Sin observaciones registradas.",
            autor: h.usuario ? `${h.usuario.nombre} ${h.usuario.apellido}` : 'Sistema',
        };
    });

    const refrescarDatos = () => {
        mutate(`/lotes-proveedor/${lote.id}`);
        mutate(`/lotes-proveedor/${lote.id}/historial-estados`);
    };

    const refrescarInsumos = () => {mutate(`/insumos-lote/por-lote-proveedor/${lote.id}`);};

    return (
        <Container>
            <PageHeader 
                title={`Recepción de Lote: ${lote.numero_lote}`} 
                subtitle={`Proveedor: ${lote.proveedor?.nombre || 'N/A'}`} 
            />

            <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                <Card.Body className="p-4">
                    <Row className="mb-3 border-bottom pb-3 align-items-center">
                        <Col sm={4} className="fw-bold text-secondary">N° de Lote</Col>
                        <Col sm={8} className="fs-6 fw-bold">{lote.numero_lote}</Col>
                    </Row>

                    <Row className="mb-3 border-bottom pb-3 align-items-center">
                        <Col sm={4} className="fw-bold text-secondary">Proveedor</Col>
                        <Col sm={8}>{lote.proveedor?.nombre} (CUIT: {lote.proveedor?.cuit})</Col>
                    </Row>

                    <Row className="mb-3 border-bottom pb-3 align-items-center">
                        <Col sm={4} className="fw-bold text-secondary">N° de Remito</Col>
                        <Col sm={8}>{lote.numero_remito || <span className="text-muted fst-italic">Sin remito</span>}</Col>
                    </Row>

                    <Row className="mb-3 border-bottom pb-3 align-items-center">
                        <Col sm={4} className="fw-bold text-secondary">Fecha de Recepcion</Col>
                        <Col sm={8}>{lote.fecha_recepcion.split("-").reverse().join("/")}</Col>
                    </Row>

                    <Row className="mb-3 border-bottom pb-3 align-items-center">
                        <Col sm={4} className="fw-bold text-secondary">Etapa Actual</Col>
                        <Col sm={8}>
                            <div
                                style={{
                                    padding: '4px 14px',
                                    borderRadius: '16px',
                                    background: confEtapa.bg,
                                    color: confEtapa.color,
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {confEtapa.label}
                            </div>
                        </Col>
                    </Row>

                    <Row className="mb-3 border-bottom pb-3 align-items-center">
                        <Col sm={4} className="fw-bold text-secondary">Registrado por</Col>
                        <Col sm={8}>
                            {lote.registrado_por
                                ? `${lote.registrado_por.nombre} ${lote.registrado_por.apellido}`
                                : 'Sistema'}
                        </Col>
                    </Row>

                    {lote.archivo_adjunto && (
                        <Row className="align-items-center pt-2">
                            <Col sm={4} className="fw-bold text-secondary">Comprobante de Remito</Col>
                            <Col sm={8}>
                                {esImagen ? (
                                    <div>
                                        <img
                                            src={lote.archivo_adjunto}
                                            alt="Remito Adjunto"
                                            style={{ maxHeight: 180, borderRadius: '8px', objectFit: 'contain' }}
                                            className="border shadow-sm p-1 bg-white"
                                        />
                                    </div>
                                ) : (
                                    <div className="p-2 px-3 border rounded bg-white d-inline-flex align-items-center gap-2 shadow-sm">
                                        <i className="bi bi-file-earmark-pdf-fill text-danger fs-3"></i>
                                        <span className="fw-semibold small">Remito_Recepcion.pdf</span>
                                        <a
                                            href={lote.archivo_adjunto}
                                            download={`Remito_${lote.numero_lote}.pdf`}
                                            className="btn btn-outline-success btn-sm ms-2 d-inline-flex align-items-center gap-1"
                                        >
                                            <i className="bi bi-download"></i> Ver / Descargar
                                        </a>
                                    </div>
                                )}
                            </Col>
                        </Row>
                    )}
                </Card.Body>
            </Card>

            <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                <Card.Header className="bg-white p-4 border-bottom d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="fw-bold mb-1">Insumos Recibidos en la Recepcion</h5>
                        <p className="text-muted small mb-0">Detalle de mercaderia física ingresada con este remito</p>
                    </div>

                    {currentUser?.operar && lote.activo && lote.estado === 'desempaque' && (
                        <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => setModalAgregarInsumo(true)}
                        >
                            <i className="bi bi-plus-circle me-1"></i>Registrar Insumo
                        </Button>
                    )}
                </Card.Header>
                <Card.Body className="p-0">
                    {cargandoInsumos ? (
                        <div className="text-muted d-flex align-items-center gap-2 p-4">
                            <Spinner animation="border" size="sm" /> Cargando insumos...
                        </div>
                    ) : !insumosLote || insumosLote.length === 0 ? (
                        <p className="text-muted small p-4 mb-0">No hay insumos registrados en este lote todavia.</p>
                    ) : (
                        <Table responsive hover className="mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Insumo</th>
                                    <th>Marca</th>
                                    <th>Recibido</th>
                                    <th>Restante</th>
                                    <th>Vencimiento</th>
                                    <th>Mín. Alerta</th>
                                    <th>Costo Unit.</th>
                                    {currentUser?.operar && lote.activo && lote.estado === 'desempaque' && (
                                        <th className="text-end pe-4">Acciones</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {insumosLote.map((item) => (
                                    <tr key={item.id}>
                                        <td className="fw-semibold">
                                            {item.insumo.nombre}{' '}
                                            <span className="text-muted small">
                                                ({item.insumo.unidad_medida?.nombre || 'U'})
                                            </span>
                                        </td>
                                        <td>{item.marca}</td>
                                        <td>
                                            <Badge bg="secondary">{item.cantidad}</Badge>
                                        </td>
                                        <td>
                                            <Badge bg={item.cantidad_restante <= item.minimo_alerta ? 'danger' : 'success'}>
                                                {item.cantidad_restante}
                                            </Badge>
                                        </td>
                                        <td>{item.fecha_vencimiento.split("-").reverse().join("/")}</td>
                                        <td>{item.minimo_alerta}</td>
                                        <td>
                                            {item.costo_unitario != null
                                                ? `$${Number(item.costo_unitario).toFixed(2)}`
                                                : '-'}
                                        </td>
                                        {currentUser?.operar && lote.activo && lote.estado === 'desempaque' && (
                                            <td className="text-end pe-4">
                                                <ActionButton
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => setInsumoAEliminar(item)}
                                                    icon="bi bi-trash"
                                                    tooltip="Eliminar insumo"
                                                >
                                                </ActionButton>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <Card className="shadow-sm border-0 mb-4 rounded-3 text-start">
                <Card.Body className="p-4">
                    <h5 className="fw-bold mb-4">Linea de Tiempo del Lote</h5>

                    <Stepper items={itemsHorizontal} pasoActual={pasoActual} direction="horizontal" colorPrimario="#198754" />

                    <hr className="my-4" />

                    <h6 className="fw-bold mb-3">Historial de etapas y observaciones</h6>
                    {cargandoHistorial ? (
                        <div className="text-muted d-flex align-items-center gap-2">
                            <Spinner animation="border" size="sm" /> Cargando historial...
                        </div>
                    ) : itemsVertical.length === 0 ? (
                        <p className="text-muted small mb-0">No hay cambios de estado registrados aun.</p>
                    ) : (
                        <Stepper items={itemsVertical} direction="vertical" colorPrimario="#198754" />
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

            <AvanzarEtapaLoteProveedorModal
                lote={modalAvanzar ? lote : null}
                onHide={() => setModalAvanzar(false)}
                onAvanzado={refrescarDatos}
            />
            <AgregarInsumoLoteModal
                show={modalAgregarInsumo}
                loteProveedorId={Number(lote.id)}
                onHide={() => setModalAgregarInsumo(false)}
                onGuardado={refrescarInsumos}
            />

            <DeleteInsumoLoteModal
                insumoLote={insumoAEliminar}
                onHide={() => setInsumoAEliminar(null)}
                onDeleted={refrescarInsumos}
            />
        </Container>
    );
}