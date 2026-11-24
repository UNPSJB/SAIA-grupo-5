import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, ButtonGroup, Col, Container, Dropdown, Form, Row } from 'react-bootstrap';
import { type TableColumn } from 'react-data-table-component';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mutate } from 'swr';
import { ActionButton } from '../../../components/ActionButton';
import { AppTable } from '../../../components/AppTable';
import { EstadoBadge } from '../../../components/EstadoBadge';
import { PageError } from '../../../components/PageError';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { useAuth } from '../../../hooks';
import { useApi } from '../../../hooks/useApi';
import { ESTADO_HISTORIAL_ESTILOS } from '../../Historial/types';
import { CambiarEstadoLoteModal } from '../../LotesProduccion/components/CambiarEstadoLoteProduccionModal';
import type { LoteProduccion } from '../../LotesProduccion/types';
import { CompletarSupervisionModal } from '../components/CompletarSupervisionModal';
import { SupervisionMovil } from '../components/SupervisionMovil';
import type { SupervisionOcurrencia } from '../types';

export function ListPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();

    const [search, setSearch] = useState('');
    const [filtroLote, setFiltroLote] = useState(searchParams.get('lote_id') ?? '');
    const [autoSeleccionado, setAutoSeleccionado] = useState(Boolean(searchParams.get('lote_id')));
    const [filtroEtapa, setFiltroEtapa] = useState('');
    const [ocurrenciaSeleccionada, setOcurrenciaSeleccionada] = useState<SupervisionOcurrencia | null>(null);
    const [loteParaAvanzar, setLoteParaAvanzar] = useState<LoteProduccion | null>(null);

    const { data: ocurrencias, error, isLoading } = useApi<SupervisionOcurrencia[]>('/supervision-lotes/');
    const { data: lotes } = useApi<LoteProduccion[]>('/lotes-produccion/');

    useEffect(() => {
        const intervalo = setInterval(() => mutate('/supervision-lotes/'), 30000);
        return () => clearInterval(intervalo);
    }, []);

    const lotesDisponibles = useMemo(() => {
        if (!Array.isArray(ocurrencias)) return [];
        const mapa = new Map<number, { id: number; etiqueta: string }>();
        ocurrencias.forEach((oc) => {
            if (!mapa.has(oc.lote_produccion_id)) {
                mapa.set(oc.lote_produccion_id, {
                    id: oc.lote_produccion_id,
                    etiqueta: `Lote #${oc.lote_produccion_id} - ${oc.producto_nombre_snap} (${oc.fase_lote_snap})`,
                });
            }
        });
        return Array.from(mapa.values());
    }, [ocurrencias]);

    useEffect(() => {
        if (!autoSeleccionado && filtroLote === '' && lotesDisponibles.length > 0) {
            setFiltroLote(String(lotesDisponibles[0].id));
            setAutoSeleccionado(true);
            return;
        }
        if (filtroLote !== '' && !lotesDisponibles.some((l) => String(l.id) === filtroLote)) {
            setFiltroLote(lotesDisponibles.length > 0 ? String(lotesDisponibles[0].id) : '');
            setFiltroEtapa('');
        }
    }, [autoSeleccionado, filtroLote, lotesDisponibles]);

    const tienePasoPrevioPendiente = (oc: SupervisionOcurrencia) => {
        if (!Array.isArray(ocurrencias)) return false;
        return ocurrencias.some(
            (otra) =>
                otra.lote_produccion_id === oc.lote_produccion_id &&
                otra.fase_lote_snap === oc.fase_lote_snap &&
                otra.estado === 'Pendiente' &&
                (otra.etapa_orden_snap < oc.etapa_orden_snap ||
                    (otra.etapa_orden_snap === oc.etapa_orden_snap && otra.paso_orden_snap < oc.paso_orden_snap))
        );
    };

    const etapasDisponibles = useMemo(() => {
        if (!Array.isArray(ocurrencias)) return [];
        const etapasUnicas = new Set(
            ocurrencias
                .filter((oc) => filtroLote === '' || String(oc.lote_produccion_id) === filtroLote)
                .map((oc) => oc.etapa_nombre_snap)
        );
        return Array.from(etapasUnicas);
    }, [ocurrencias, filtroLote]);

    const filteredOcurrencias = useMemo(() => {
        if (!Array.isArray(ocurrencias)) return [];
        return ocurrencias.filter((oc) => {
            const coincideLote = filtroLote === '' || String(oc.lote_produccion_id) === filtroLote;
            const coincideEtapa = filtroEtapa === '' || oc.etapa_nombre_snap === filtroEtapa;
            const texto = search.toLowerCase();
            const coincideBusqueda =
                oc.paso_descripcion_snap.toLowerCase().includes(texto) ||
                oc.etapa_nombre_snap.toLowerCase().includes(texto) ||
                oc.producto_nombre_snap.toLowerCase().includes(texto) ||
                `lote #${oc.lote_produccion_id}`.includes(texto);
            return coincideLote && coincideEtapa && coincideBusqueda;
        });
    }, [ocurrencias, filtroLote, filtroEtapa, search]);

    const lotesListosParaAvanzar = useMemo(() => {
        if (!Array.isArray(ocurrencias) || !Array.isArray(lotes)) return [];
        const porLote = new Map<number, SupervisionOcurrencia[]>();
        ocurrencias.forEach((oc) => {
            if (filtroLote !== '' && String(oc.lote_produccion_id) !== filtroLote) return;
            const lista = porLote.get(oc.lote_produccion_id) ?? [];
            lista.push(oc);
            porLote.set(oc.lote_produccion_id, lista);
        });

        const listos: LoteProduccion[] = [];
        porLote.forEach((items, loteId) => {
            if (items.length > 0 && items.every((item) => item.estado === 'Completada')) {
                const loteEncontrado = lotes.find((l) => l.id === loteId);
                if (loteEncontrado) listos.push(loteEncontrado);
            }
        });
        return listos;
    }, [ocurrencias, lotes, filtroLote]);

    const handleReportarIncidente = (oc: SupervisionOcurrencia) => {
        navigate('/incidentes/new', {
            state: {
                lote_produccion_id: oc.lote_produccion_id,
                nombre: `Incidente en ${oc.etapa_nombre_snap} - Lote #${oc.lote_produccion_id}`.slice(0, 60),
                descripcion: `Incidente detectado durante la supervision del paso "${oc.paso_descripcion_snap}" en Lote #${oc.lote_produccion_id} (${oc.producto_nombre_snap}).`,
            },
        });
    };

    const subHeaderComponentMemo = useMemo(() => {
        const loteSeleccionadoObj = lotesDisponibles.find((l) => String(l.id) === filtroLote);
        return (
            <div className="d-flex align-items-center gap-2">
                <Dropdown as={ButtonGroup} size="sm">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                            setFiltroLote('');
                            setFiltroEtapa('');
                        }}
                        className="text-truncate text-start"
                        style={{ maxWidth: '210px' }}
                    >
                        {loteSeleccionadoObj ? loteSeleccionadoObj.etiqueta : 'Todos los lotes'}
                    </Button>
                    <Dropdown.Toggle split variant="outline-secondary" size="sm" id="dropdown-filtro-lotes-sup" />
                    <Dropdown.Menu>
                        <Dropdown.Item
                            active={filtroLote === ''}
                            onClick={() => {
                                setFiltroLote('');
                                setFiltroEtapa('');
                            }}
                        >
                            Todos los lotes activos
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        {lotesDisponibles.map((l) => (
                            <Dropdown.Item
                                key={l.id}
                                active={filtroLote === String(l.id)}
                                onClick={() => {
                                    setFiltroLote(String(l.id));
                                    setFiltroEtapa('');
                                }}
                            >
                                {l.etiqueta}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>

                <Dropdown as={ButtonGroup} size="sm">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setFiltroEtapa('')}
                        className="text-truncate text-start"
                        style={{ maxWidth: '160px' }}
                    >
                        {filtroEtapa ? filtroEtapa : 'Todas las etapas'}
                    </Button>
                    <Dropdown.Toggle split variant="outline-secondary" size="sm" id="dropdown-filtro-etapas-sup" />
                    <Dropdown.Menu>
                        <Dropdown.Item active={filtroEtapa === ''} onClick={() => setFiltroEtapa('')}>
                            Todas las etapas
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        {etapasDisponibles.map((etapa) => (
                            <Dropdown.Item
                                key={etapa}
                                active={filtroEtapa === etapa}
                                onClick={() => setFiltroEtapa(etapa)}
                            >
                                {etapa}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>

                <Form.Control
                    type="text"
                    size="sm"
                    placeholder="Buscar paso..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '180px' }}
                />
            </div>
        );
    }, [search, lotesDisponibles, etapasDisponibles, filtroLote, filtroEtapa]);

    if (isLoading) return <PageLoading title="Checklist de Supervision" />;
    if (!ocurrencias || error) {
        return <PageError title="Checklist de Supervision" message="Ocurrio un error al cargar el checklist de supervision" />;
    }

    const columns: TableColumn<SupervisionOcurrencia>[] = [
        {
            name: 'Paso',
            selector: (row) => row.paso_descripcion_snap,
            sortable: true,
            center: true,
            wrap: true,
            minWidth: '260px',
            grow: 3,
            cell: (row) => (
                <div style={{ padding: '8px 0', minWidth: 0, maxWidth: '100%', overflowWrap: 'anywhere' }}>
                    <div
                        style={{
                            fontWeight: 600,
                            textDecoration: row.estado === 'Completada' ? 'line-through' : 'none',
                        }}
                    >
                        {row.paso_orden_snap}. {row.paso_descripcion_snap}
                    </div>
                    {row.observacion && (
                        <div className="text-muted small fst-italic">Observacion: {row.observacion}</div>
                    )}
                </div>
            ),
        },
        {
            name: 'Etapa',
            selector: (row) => row.etapa_nombre_snap,
            sortable: true,
            center: true,
            minWidth: '170px',
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: '#dbeafe',
                            color: '#1d4ed8',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                        }}
                    >
                        {row.etapa_nombre_snap}
                    </div>
                </div>
            ),
        },
        {
            name: 'Lote / Producto',
            selector: (row) => row.lote_produccion_id,
            sortable: true,
            center: true,
            minWidth: '210px',
            grow: 1.5,
            cell: (row) => (
                <div className="py-1 text-center">
                    <Button
                        variant="link"
                        size="sm"
                        className="p-0 fw-bold text-decoration-none"
                        onClick={() => navigate(`/lotes-produccion/${row.lote_produccion_id}`)}
                    >
                        Lote #{row.lote_produccion_id} - {row.producto_nombre_snap}
                    </Button>
                    <div className="small text-muted">{row.cantidad_lote_snap}</div>
                    <Badge bg={row.fase_lote_snap === 'En produccion' ? 'warning' : 'info'} text="dark" className="mt-1">
                        {row.fase_lote_snap}
                    </Badge>
                </div>
            ),
        },
        {
            name: 'Estado',
            selector: (row) => (row.estado === 'Completada' ? 'Realizada' : 'Pendiente'),
            sortable: true,
            center: true,
            minWidth: '130px',
            cell: (row) => (
                <EstadoBadge
                    tono={ESTADO_HISTORIAL_ESTILOS[row.estado === 'Completada' ? 'Completada' : 'Pendiente'].tono}
                    icono={ESTADO_HISTORIAL_ESTILOS[row.estado === 'Completada' ? 'Completada' : 'Pendiente'].icono}
                >
                    {row.estado === 'Completada' ? 'Realizada' : 'Pendiente'}
                </EstadoBadge>
            ),
        },
        {
            name: 'Acciones',
            center: true,
            minWidth: '160px',
            cell: (row) => {
                const estaCompletada = row.estado === 'Completada';
                const laHizoOtro = estaCompletada && row.supervisor_id !== currentUser?.id;
                const bloqueadoPorPasoPrevio = !estaCompletada && tienePasoPrevioPendiente(row);
                const tienePermiso = currentUser?.supervisor === true;
                if (!tienePermiso) return <>-</>;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ActionButton
                            variant={estaCompletada ? 'outline-info' : 'outline-success'}
                            size="sm"
                            disabled={laHizoOtro || bloqueadoPorPasoPrevio}
                            tooltip={
                                laHizoOtro
                                    ? 'Completada por otro supervisor'
                                    : bloqueadoPorPasoPrevio
                                    ? 'Completa los pasos anteriores primero'
                                    : estaCompletada
                                    ? 'Editar'
                                    : 'Marcar realizada'
                            }
                            icon={estaCompletada ? 'bi-pencil' : 'bi-check2-circle'}
                            onClick={() => setOcurrenciaSeleccionada(row)}
                        />
                        <ActionButton
                            variant="outline-danger"
                            size="sm"
                            tooltip="Reportar incidente del lote"
                            icon="bi-exclamation-diamond"
                            onClick={() => handleReportarIncidente(row)}
                        />
                    </div>
                );
            },
        },
    ];

    const fechaLarga = new Date().toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="PRODUCCION"
                        title="Checklist de Supervision"
                        subtitle={`${fechaLarga}`}
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
            </Row>

            {(currentUser?.supervisor || currentUser?.operar) &&
                lotesListosParaAvanzar.map((loteListo) => {
                    const faltanInsumos =
                        loteListo.estado === 'En produccion' && loteListo.insumos_completos === false;
                    return (
                        <Alert
                            key={loteListo.id}
                            variant={faltanInsumos ? 'warning' : 'success'}
                            className="d-flex flex-wrap justify-content-between align-items-center gap-2 py-2 px-3 mb-3"
                        >
                            <div>
                                <i className={`bi ${faltanInsumos ? 'bi-exclamation-triangle' : 'bi-check2-all'} me-2`}></i>
                                <strong>Lote #{loteListo.id} ({loteListo.producto.nombre}):</strong> Todos los pasos de la fase{' '}
                                <strong>{loteListo.estado}</strong> estan completados.
                                {faltanInsumos && (
                                    <span className="ms-1">
                                        Faltan asociar los insumos requeridos por la receta para pasar a Empaquetando.
                                    </span>
                                )}
                            </div>
                            <Button
                                variant={faltanInsumos ? 'secondary' : 'success'}
                                size="sm"
                                disabled={faltanInsumos}
                                onClick={() => setLoteParaAvanzar(loteListo)}
                            >
                                <i className="bi bi-arrow-right-circle me-1"></i>
                                {loteListo.estado === 'En produccion'
                                    ? 'Pasar a Empaquetando'
                                    : 'Marcar como Terminado'}
                            </Button>
                        </Alert>
                    );
                })}

            <div className="d-none d-lg-block">
                <AppTable columns={columns} data={filteredOcurrencias} />
            </div>
            <div className="d-lg-none">
                {filteredOcurrencias.map((oc) => (
                    <SupervisionMovil
                        key={oc.id}
                        ocurrencia={oc}
                        bloqueadoPorPasoPrevio={oc.estado !== 'Completada' && tienePasoPrevioPendiente(oc)}
                        onCompletar={setOcurrenciaSeleccionada}
                        onReportarIncidente={handleReportarIncidente}
                    />
                ))}
                {filteredOcurrencias.length === 0 && (
                    <p className="text-muted text-center p-4">No se encontraron pasos de supervision pendientes.</p>
                )}
            </div>

            <CompletarSupervisionModal
                ocurrencia={ocurrenciaSeleccionada}
                onHide={() => setOcurrenciaSeleccionada(null)}
                onCompleted={() => {
                    mutate('/supervision-lotes/');
                    mutate('/lotes-produccion/');
                }}
            />

            <CambiarEstadoLoteModal
                lote={loteParaAvanzar}
                onHide={() => setLoteParaAvanzar(null)}
                onChanged={() => {
                    mutate('/lotes-produccion/');
                    mutate('/supervision-lotes/');
                }}
            />
        </Container>
    );
}
