import { Badge, Button, Card, Col, Row, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from '../../../components/ActionButton';
import { PageLoading } from '../../../components/PageLoading';
import { useApi } from '../../../hooks/useApi';
import type {
    TrazabilidadInsumoLoteData,
    TrazabilidadLoteProduccionData,
    TrazabilidadLoteProveedorData,
} from '../types';

interface TarjetaTrazabilidadLoteProps {
    modo: 'lote_produccion' | 'insumo_lote' | 'lote_proveedor';
    entidadId: number;
    puedeDespachar?: boolean;
    onNuevoEnvio?: () => void;
    onVerEnvio?: (envioId: number) => void;
    onRegistrarRecepcion?: (envioId: number) => void;
}

const formatearFecha = (fecha?: string | null) =>
    fecha ? fecha.split('-').reverse().join('/') : '-';

export function TarjetaTrazabilidadLote({
    modo,
    entidadId,
    puedeDespachar,
    onNuevoEnvio,
    onVerEnvio,
    onRegistrarRecepcion,
}: TarjetaTrazabilidadLoteProps) {
    const navigate = useNavigate();

    const endpoint =
        modo === 'lote_produccion'
            ? `/lotes-produccion/${entidadId}/trazabilidad`
            : modo === 'insumo_lote'
            ? `/insumos-lote/${entidadId}/trazabilidad`
            : `/lotes-proveedor/${entidadId}/trazabilidad`;

    const { data, isLoading, error } = useApi<TrazabilidadLoteProduccionData | TrazabilidadInsumoLoteData | TrazabilidadLoteProveedorData>(endpoint);

    if (isLoading) { return <PageLoading title="Cargando trazabilidad" /> }

    if (error || !data) {
        return (
            <p className="text-muted small mb-0">
                No se pudo cargar la trazabilidad completa en este momento.
            </p>
        );
    }

    if (modo === 'lote_produccion') {
        const trazabilidad = data as TrazabilidadLoteProduccionData;
        return (
            <section className="mt-2">
                <h5 className="mb-3">
                    <i className="bi bi-diagram-3 me-2 text-primary"></i>
                    Trazabilidad Completa (Simulador de Retiro)
                </h5>
                <Row className="g-3">
                    <Col md={6}>
                        <Card className="h-100 border bg-light-subtle">
                            <Card.Header className="bg-light fw-bold">
                                <i className="bi bi-arrow-left-circle me-2 text-secondary"></i>
                                Origen (Proveedores e Insumos)
                            </Card.Header>
                            <Card.Body className="p-2">
                                {trazabilidad.origenes.length === 0 ? (
                                    <p className="text-muted small mb-0 p-2">Sin insumos de origen asociados.</p>
                                ) : (
                                    <Table size="sm" responsive hover className="mb-0 align-middle">
                                        <thead>
                                            <tr>
                                                <th>Insumo / Lote</th>
                                                <th>Proveedor / Remito</th>
                                                <th>Cant.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trazabilidad.origenes.map((origen) => (
                                                <tr key={origen.insumo_lote_id}>
                                                    <td>
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="p-0 fw-semibold text-decoration-none text-start"
                                                            onClick={() => navigate(`/insumos-lote/${origen.insumo_lote_id}`)}
                                                        >
                                                            {origen.insumo_nombre} ({origen.marca})
                                                        </Button>
                                                        <p className="text-muted small mb-0">Lote: {origen.numero_lote_insumo}</p>
                                                    </td>
                                                    <td>
                                                        {origen.proveedor_id ? (
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                className="p-0 text-decoration-none text-secondary text-start d-block"
                                                                onClick={() => navigate(`/proveedores/${origen.proveedor_id}`)}
                                                            >
                                                                {origen.proveedor_nombre}
                                                            </Button>
                                                        ) : (
                                                            <span>-</span>
                                                        )}
                                                        {origen.lote_proveedor_id && (
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                className="p-0 text-decoration-none small"
                                                                onClick={() => navigate(`/recepciones/${origen.lote_proveedor_id}`)}
                                                            >
                                                                Remito {origen.numero_remito || `#${origen.lote_proveedor_id}`}
                                                            </Button>
                                                        )}
                                                    </td>
                                                    <td className="small">
                                                        {Number(origen.cantidad_utilizada).toLocaleString('es-AR')} {origen.unidad_medida}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6}>
                        <Card className="h-100 border bg-light-subtle">
                            <Card.Header className="bg-light fw-bold d-flex justify-content-between align-items-center">
                                <div>
                                    <i className="bi bi-arrow-right-circle me-2 text-success"></i>
                                    Destino (Clientes y Envios)
                                </div>
                                {puedeDespachar && onNuevoEnvio && (
                                    <Button variant="outline-success" size="sm" onClick={onNuevoEnvio}>
                                        <i className="bi bi-truck me-1"></i>Nuevo Envio
                                    </Button>
                                )}
                            </Card.Header>
                            <Card.Body className="p-2">
                                {trazabilidad.destinos.length === 0 ? (
                                    <p className="text-muted small mb-0 p-2">Este lote aun no tiene envios despachados.</p>
                                ) : (
                                    <Table size="sm" responsive hover className="mb-0 align-middle">
                                        <thead>
                                            <tr>
                                                <th>Cliente</th>
                                                <th>Remito / Fecha</th>
                                                <th>Cant. / Estado</th>
                                                {(onVerEnvio || onRegistrarRecepcion) && (
                                                    <th className="text-center" style={{ width: '80px', minWidth: '80px' }}>
                                                        Accion
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trazabilidad.destinos.map((destino) => (
                                                <tr key={destino.envio_id}>
                                                    <td>
                                                        <p className="fw-semibold mb-0">{destino.cliente_razon_social}</p>
                                                        <p className="text-muted small mb-0">{destino.direccion}</p>
                                                    </td>
                                                    <td className="small" style={{ whiteSpace: 'nowrap' }}>
                                                        <p className="mb-0">Remito: {destino.numero_remito}</p>
                                                        <p className="text-muted mb-0">{formatearFecha(destino.fecha_envio)}</p>
                                                    </td>
                                                    <td style={{ whiteSpace: 'nowrap' }}>
                                                        <p className="fw-semibold mb-1">{destino.cantidad} u.</p>
                                                        <Badge
                                                            bg={
                                                                destino.estado === 'Entregado'
                                                                    ? 'success'
                                                                    : destino.estado === 'Rechazado'
                                                                    ? 'danger'
                                                                    : 'warning'
                                                            }
                                                        >
                                                            {destino.estado}
                                                        </Badge>
                                                    </td>
                                                    {(onVerEnvio || onRegistrarRecepcion) && (
                                                        <td className="text-center" style={{ width: '80px', minWidth: '80px' }}>
                                                            <div className="d-flex align-items-center justify-content-center gap-1">
                                                                {onVerEnvio && (
                                                                    <ActionButton
                                                                        variant="outline-info"
                                                                        size="sm"
                                                                        tooltip="Ver detalle del envio"
                                                                        icon="bi-eye"
                                                                        onClick={() => onVerEnvio(destino.envio_id)}
                                                                    />
                                                                )}
                                                                {onRegistrarRecepcion && destino.estado === 'En camino' && (
                                                                    <ActionButton
                                                                        variant="outline-success"
                                                                        size="sm"
                                                                        tooltip="Registrar recepcion del cliente"
                                                                        icon="bi-check2-circle"
                                                                        onClick={() => onRegistrarRecepcion(destino.envio_id)}
                                                                    />
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </section>
        );
    }

    if (modo === 'insumo_lote') {
        const trazabilidad = data as TrazabilidadInsumoLoteData;
        return (
            <section className="mt-2">
                <h5 className="mb-3">
                    <i className="bi bi-diagram-3 me-2 text-primary"></i>
                    Cadena de Trazabilidad Completa (Clientes Alcanzados)
                </h5>
                {trazabilidad.producciones.length === 0 ? (
                    <p className="text-muted small mb-0">
                        Este insumo aun no fue utilizado en produccion ni llego a clientes.
                    </p>
                ) : (
                    trazabilidad.producciones.map((produccion) => (
                        <Card key={produccion.lote_produccion_id} className="mb-3 border">
                            <Card.Header className="bg-light d-flex justify-content-between align-items-center py-2">
                                <Button
                                    variant="link"
                                    className="p-0 fw-bold text-decoration-none"
                                    onClick={() => navigate(`/lotes-produccion/${produccion.lote_produccion_id}`)}
                                >
                                    Lote Produccion #{produccion.lote_produccion_id} - {produccion.producto_nombre} ({formatearFecha(produccion.fecha_produccion)})
                                </Button>
                                <Badge bg="secondary">{produccion.estado}</Badge>
                            </Card.Header>
                            <Card.Body className="p-2">
                                {produccion.envios.length === 0 ? (
                                    <p className="text-muted small mb-0 px-2">Sin envios a clientes registrados para este lote.</p>
                                ) : (
                                    <Table size="sm" responsive hover className="mb-0 align-middle">
                                        <thead>
                                            <tr>
                                                <th>Cliente</th>
                                                <th>Direccion</th>
                                                <th>Remito</th>
                                                <th>Cantidad</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {produccion.envios.map((envio) => (
                                                <tr key={envio.envio_id}>
                                                    <td className="fw-semibold">{envio.cliente_razon_social}</td>
                                                    <td className="small text-muted">{envio.direccion}</td>
                                                    <td className="small">{envio.numero_remito} ({formatearFecha(envio.fecha_envio)})</td>
                                                    <td>{envio.cantidad} u.</td>
                                                    <td>
                                                        <Badge bg={envio.estado === 'Entregado' ? 'success' : envio.estado === 'Rechazado' ? 'danger' : 'warning'}>
                                                            {envio.estado}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                        </Card>
                    ))
                )}
            </section>
        );
    }

    const trazabilidad = data as TrazabilidadLoteProveedorData;
    return (
        <Card className="shadow-sm border-0 mb-4 rounded-3 text-start">
            <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">
                    <i className="bi bi-diagram-3 me-2 text-primary"></i>
                    Trazabilidad Completa hacia Produccion y Clientes
                </h5>
                {trazabilidad.insumos.length === 0 ? (
                    <p className="text-muted small mb-0">No hay insumos registrados en esta recepcion.</p>
                ) : (
                    trazabilidad.insumos.map((insumo) => (
                        <Card key={insumo.insumo_lote_id} className="mb-3 border">
                            <Card.Header className="bg-light d-flex justify-content-between align-items-center py-2">
                                <Button
                                    variant="link"
                                    className="p-0 fw-bold text-decoration-none"
                                    onClick={() => navigate(`/insumos-lote/${insumo.insumo_lote_id}`)}
                                >
                                    {insumo.insumo_nombre} - {insumo.marca} (Lote: {insumo.numero_lote_insumo})
                                </Button>
                                <Badge bg="secondary">
                                    Restante: {insumo.cantidad_restante} / {insumo.cantidad} {insumo.unidad_medida}
                                </Badge>
                            </Card.Header>
                            <Card.Body className="p-2">
                                {insumo.producciones.length === 0 ? (
                                    <p className="text-muted small mb-0 px-2">Aun no utilizado en lotes de produccion.</p>
                                ) : (
                                    <Table size="sm" responsive hover className="mb-0 align-middle">
                                        <thead>
                                            <tr>
                                                <th>Lote Produccion</th>
                                                <th>Estado</th>
                                                <th>Envios a Clientes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {insumo.producciones.map((produccion) => (
                                                <tr key={produccion.lote_produccion_id}>
                                                    <td>
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="p-0 fw-semibold text-decoration-none"
                                                            onClick={() => navigate(`/lotes-produccion/${produccion.lote_produccion_id}`)}
                                                        >
                                                            Lote #{produccion.lote_produccion_id} ({produccion.producto_nombre})
                                                        </Button>
                                                    </td>
                                                    <td>
                                                        <Badge bg="secondary">{produccion.estado}</Badge>
                                                    </td>
                                                    <td className="small">
                                                        {produccion.envios.length === 0 ? (
                                                            <span className="text-muted">Sin envios registrados</span>
                                                        ) : (
                                                            produccion.envios.map((envio) => (
                                                                <p key={envio.envio_id} className="mb-0">
                                                                    <strong>{envio.cliente_razon_social}</strong> | Remito {envio.numero_remito} | {envio.cantidad} u. ({envio.estado})
                                                                </p>
                                                            ))
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                        </Card>
                    ))
                )}
            </Card.Body>
        </Card>
    );
}
