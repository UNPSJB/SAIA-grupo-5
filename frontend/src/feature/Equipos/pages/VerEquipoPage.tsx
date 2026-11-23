import { useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { mutate } from 'swr';
import { PageError } from '../../../components/PageError';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import { GraficoTemperaturaEquipo } from '../components/GraficoTemperaturaEquipo';
import { RegistrarTemperaturaModal } from '../components/RegistrarTemperaturaModal';
import type { AlmacenamientoEquipoResponse, Equipo, RegistroTemperatura } from '../types';

export function VerEquipoPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [soloAlertas, setSoloAlertas] = useState(false);
    const [mostrarModalTemp, setMostrarModalTemp] = useState(false);

    const { data: equipo, isLoading, error } = useApi<Equipo>(id ? `/equipos/${id}` : null);
    const { data: registros } = useApi<RegistroTemperatura[]>(
        id && equipo?.controla_temperatura
            ? `/registros-temperatura/equipo/${id}${soloAlertas ? '?solo_alertas=true' : ''}`
            : null
    );
    const { data: todosRegistros } = useApi<RegistroTemperatura[]>(
        id && equipo?.controla_temperatura ? `/registros-temperatura/equipo/${id}` : null
    );
    const { data: almacenamiento } = useApi<AlmacenamientoEquipoResponse>(
        id ? `/equipos/${id}/almacenamiento` : null
    );

    const puedeRegistrarTemperatura = Boolean(currentUser?.operar || currentUser?.supervisor);

    if (isLoading) return <PageLoading title="Detalle del Equipo" />;
    if (error || !equipo) {
        return <PageError title="Detalle del Equipo" message="No se pudo cargar la informacion del equipo." />;
    }

    const refrescarRegistros = () => {
        if (!id) return;
        mutate(`/registros-temperatura/equipo/${id}`);
        mutate(`/registros-temperatura/equipo/${id}?solo_alertas=true`);
        mutate(`/equipos/${id}/almacenamiento`);
    };

    const registrosTabla = registros ?? [];
    const registrosGrafico = todosRegistros ?? [];

    return (
        <Container className="pb-4">
            <PageHeader
                title={equipo.nombre}
                subtitle={`Sector: ${equipo.sector?.nombre || '-'}`}
            />

            <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                <Card.Body className="p-4">
                    <Row className="mb-3 border-bottom pb-3 align-items-center">
                        <Col sm={5} className="fw-bold text-secondary">Nombre del Equipo</Col>
                        <Col sm={7} className="fs-6 fw-semibold">{equipo.nombre}</Col>
                    </Row>

                    <Row className="mb-3 border-bottom pb-3 align-items-center">
                        <Col sm={5} className="fw-bold text-secondary">Sector</Col>
                        <Col sm={7} className="fs-6">{equipo.sector?.nombre || '-'}</Col>
                    </Row>

                    <Row className="mb-3 border-bottom pb-3 align-items-center">
                        <Col sm={5} className="fw-bold text-secondary">Categoria</Col>
                        <Col sm={7} className="fs-6">{equipo.categoria || '-'}</Col>
                    </Row>

                    <Row className="mb-3 border-bottom pb-3 align-items-center">
                        <Col sm={5} className="fw-bold text-secondary">Ubicacion</Col>
                        <Col sm={7} className="fs-6">{equipo.ubicacion || '-'}</Col>
                    </Row>

                    <Row className="mb-3 border-bottom pb-3 align-items-center">
                        <Col sm={5} className="fw-bold text-secondary">Estado</Col>
                        <Col sm={7}>
                            <div
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '20px',
                                    background: equipo.estado ? '#dcfce7' : '#fee2e2',
                                    color: equipo.estado ? '#166534' : '#991b1b',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {equipo.estado ? 'Activo' : 'Inactivo'}
                            </div>
                        </Col>
                    </Row>

                    <Row className="align-items-center">
                        <Col sm={5} className="fw-bold text-secondary">Control de Temperatura</Col>
                        <Col sm={7}>
                            {equipo.controla_temperatura ? (
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                                    <div>
                                        <Badge bg="info" text="dark" className="me-2">
                                            Control activo
                                        </Badge>
                                        <span>
                                            Rango permitido: <strong>{equipo.temperatura_minima} C</strong> a{' '}
                                            <strong>{equipo.temperatura_maxima} C</strong>
                                        </span>
                                    </div>
                                    {puedeRegistrarTemperatura && equipo.estado && (
                                        <Button variant="primary" size="sm" onClick={() => setMostrarModalTemp(true)}>
                                            <i className="bi bi-thermometer-half me-1"></i>
                                            Registrar temperatura
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <span className="text-muted">No requiere control de temperatura</span>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {equipo.controla_temperatura && (
                <>
                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                        <Card.Header className="bg-white p-4 border-bottom">
                            <h5 className="fw-bold mb-1">
                                <i className="bi bi-graph-up me-2 text-success"></i>
                                Evolucion termica
                            </h5>
                            <p className="text-muted small mb-0">
                                Historial grafico de mediciones respecto a los limites minimo y maximo
                            </p>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <GraficoTemperaturaEquipo
                                registros={registrosGrafico}
                                temperaturaMinima={equipo.temperatura_minima ?? 0}
                                temperaturaMaxima={equipo.temperatura_maxima ?? 0}
                            />
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                        <Card.Header className="bg-white p-4 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <div>
                                <h5 className="fw-bold mb-1">Historial de registros de temperatura</h5>
                                <p className="text-muted small mb-0">Mediciones cargadas por operarios y supervisores</p>
                            </div>
                            <Form.Check
                                type="switch"
                                id="filtro-solo-alertas-temp"
                                label="Solo alertas fuera de rango"
                                checked={soloAlertas}
                                onChange={(e) => setSoloAlertas(e.target.checked)}
                            />
                        </Card.Header>
                        <Card.Body className="p-0">
                            {registrosTabla.length === 0 ? (
                                <p className="text-muted small p-4 mb-0">
                                    {soloAlertas
                                        ? 'No hay registros fuera de rango para este equipo.'
                                        : 'Aun no se registraron mediciones de temperatura.'}
                                </p>
                            ) : (
                                <Table responsive hover className="mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Fecha y Hora</th>
                                            <th>Temperatura</th>
                                            <th>Estado</th>
                                            <th>Responsable</th>
                                            <th>Accion tomada</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registrosTabla.map((reg) => (
                                            <tr key={reg.id}>
                                                <td className="small text-nowrap">
                                                    {new Date(reg.fecha_hora_registro).toLocaleString('es-AR', {
                                                        hour12: false,
                                                    })}
                                                </td>
                                                <td className="fw-bold">
                                                    <span className={reg.fuera_de_rango ? 'text-danger' : 'text-success'}>
                                                        {reg.temperatura_registrada} C
                                                    </span>
                                                </td>
                                                <td>
                                                    <Badge bg={reg.fuera_de_rango ? 'danger' : 'success'}>
                                                        {reg.fuera_de_rango ? 'Fuera de rango' : 'En rango'}
                                                    </Badge>
                                                </td>
                                                <td className="small">
                                                    {reg.operario
                                                        ? `${reg.operario.nombre} ${reg.operario.apellido}`
                                                        : '-'}
                                                </td>
                                                <td className="small text-muted">
                                                    {reg.accion_tomada || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </>
            )}

            <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                <Card.Header className="bg-white p-4 border-bottom">
                    <h5 className="fw-bold mb-1">
                        <i className="bi bi-box-seam me-2 text-primary"></i>
                        Mercaderia almacenada actualmente en este equipo
                    </h5>
                    <p className="text-muted small mb-0">
                        Insumos alimenticios y lotes de produccion con stock disponible ubicados aqui
                    </p>
                </Card.Header>
                <Card.Body className="p-4">
                    <Row className="g-4">
                        <Col md={6}>
                            <h6 className="fw-bold mb-2">Insumos Alimenticios</h6>
                            {!almacenamiento || almacenamiento.insumos.length === 0 ? (
                                <p className="text-muted small mb-0">No hay insumos almacenados en este equipo.</p>
                            ) : (
                                <Table size="sm" responsive hover className="mb-0 align-middle">
                                    <thead>
                                        <tr>
                                            <th>Insumo</th>
                                            <th>Lote</th>
                                            <th>Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {almacenamiento.insumos.map((insumo) => (
                                            <tr key={insumo.id}>
                                                <td>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="p-0 text-decoration-none fw-semibold text-start"
                                                        onClick={() => navigate(`/insumos-lote/${insumo.id}`)}
                                                    >
                                                        {insumo.insumo_nombre} ({insumo.marca})
                                                    </Button>
                                                </td>
                                                <td className="small">{insumo.numero_lote}</td>
                                                <td className="small fw-semibold">
                                                    {insumo.cantidad_restante} {insumo.unidad_medida}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Col>
                        <Col md={6}>
                            <h6 className="fw-bold mb-2">Lotes de Produccion</h6>
                            {!almacenamiento || almacenamiento.lotes_produccion.length === 0 ? (
                                <p className="text-muted small mb-0">No hay lotes de produccion almacenados en este equipo.</p>
                            ) : (
                                <Table size="sm" responsive hover className="mb-0 align-middle">
                                    <thead>
                                        <tr>
                                            <th>Lote / Producto</th>
                                            <th>Estado</th>
                                            <th>Disp.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {almacenamiento.lotes_produccion.map((lote) => (
                                            <tr key={lote.id}>
                                                <td>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="p-0 text-decoration-none fw-semibold text-start"
                                                        onClick={() => navigate(`/lotes-produccion/${lote.id}`)}
                                                    >
                                                        Lote #{lote.id} - {lote.producto_nombre}
                                                    </Button>
                                                </td>
                                                <td>
                                                    <Badge bg="secondary">{lote.estado}</Badge>
                                                </td>
                                                <td className="small fw-semibold">{lote.cantidad_disponible} u.</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={() => navigate('/equipos')}>
                    <i className="bi bi-arrow-left me-1"></i>Volver al listado
                </Button>
                {currentUser?.administrar && equipo.estado && (
                    <Button variant="primary" onClick={() => navigate(`/equipos/${equipo.id}/edit`)}>
                        <i className="bi bi-pencil me-1"></i>Editar Equipo
                    </Button>
                )}
            </div>

            {mostrarModalTemp && (
                <RegistrarTemperaturaModal
                    equipo={equipo}
                    onHide={() => setMostrarModalTemp(false)}
                    onRegistrado={refrescarRegistros}
                />
            )}
        </Container>
    );
}
