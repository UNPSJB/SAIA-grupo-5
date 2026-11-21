import { useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Form, InputGroup, Spinner } from 'react-bootstrap';
import { type ConditionalStyles, type TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { mutate } from 'swr';
import { AppTable } from '../../../components/AppTable';
import { useApi } from '../../../hooks/useApi';
import { api } from '../../../libs/axios';
import type { Notificacion } from '../types';
import '../Notificaciones.css';

const NOTIFICATIONS_URL = '/notificaciones/';

function formatDate(value: string) {
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

const ETIQUETAS_TIPO: Record<string, { label: string; bg: string }> = {
    recambio_elemento: { label: 'Recambio de elemento', bg: 'info' },
    calibracion_equipo: { label: 'Calibracion de equipo', bg: 'primary' },
    vencimiento_personal: { label: 'Vencimiento personal', bg: 'secondary' },
    alerta_stock: { label: 'Stock bajo', bg: 'danger' },
    vencimiento_insumo_lote: { label: 'Vencimiento insumo', bg: 'warning' },
    habilitacion_proveedor: { label: 'Habilitacion proveedor', bg: 'dark' },
    pedido_proveedor_demorado: { label: 'Pedido demorado', bg: 'danger' },
    incidente_lote_produccion: { label: 'Incidente produccion', bg: 'danger' },
    incidente_lote_proveedor: { label: 'Incidente recepcion', bg: 'danger' },
    incidente_insumo_lote: { label: 'Incidente insumo', bg: 'danger' },
    temperatura_fuera_rango: { label: 'Temperatura fuera de rango', bg: 'danger' },
};

const ETIQUETAS_ENTIDAD: Record<string, string> = {
    InsumoLote: 'Insumo Alimenticio',
    LoteProduccion: 'Lote de Produccion',
    LoteProveedor: 'Recepcion de Proveedor',
    Proveedor: 'Proveedor',
    PedidoProveedor: 'Pedido a Proveedor',
    ElementoLimpieza: 'Elemento de Limpieza',
    VencimientoPersonal: 'Personal',
    Equipo: 'Equipo / Camara',
};

export function NotificacionesPage() {
    const navigate = useNavigate();
    const { data: notifications, error, isLoading } = useApi<Notificacion[]>(NOTIFICATIONS_URL);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'todas' | 'pendientes' | 'leidas' | 'resueltas'>('todas');

    const filteredNotifications = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase('es');
        return (notifications ?? []).filter((notification) => {
            const matchesFilter = filter === 'todas'
                || (filter === 'pendientes' && !notification.leida && !notification.resuelta)
                || (filter === 'leidas' && notification.leida && !notification.resuelta)
                || (filter === 'resueltas' && notification.resuelta);
            const searchable = `${notification.titulo} ${notification.entidad} ${notification.descripcion} ${notification.tipo}`.toLocaleLowerCase('es');
            return matchesFilter && (!normalizedSearch || searchable.includes(normalizedSearch));
        });
    }, [filter, notifications, search]);

    const markRead = async (notification: Notificacion) => {
        await api.patch(`/notificaciones/${notification.id}/leida`);
        await mutate(NOTIFICATIONS_URL);
    };

    const markAllRead = async () => {
        const unread = (notifications ?? []).filter((notification) => !notification.leida);
        await Promise.all(unread.map((notification) => api.patch(`/notificaciones/${notification.id}/leida`)));
        await mutate(NOTIFICATIONS_URL);
    };

    const columns: TableColumn<Notificacion>[] = [
        {
            name: 'Novedad',
            selector: (notification) => notification.titulo,
            sortable: true,
            grow: 2,
            minWidth: '220px',
            cell: (notification) => <div><strong>{notification.titulo}</strong><div className="small text-muted mt-1">{notification.descripcion}</div></div>,
        },
        {
            name: 'Elemento / entidad',
            selector: (notification) => ETIQUETAS_ENTIDAD[notification.entidad] || notification.entidad,
            sortable: true,
            minWidth: '175px',
            cell: (notification) => {
                const info = ETIQUETAS_TIPO[notification.tipo];
                const nombreEntidad = ETIQUETAS_ENTIDAD[notification.entidad] || notification.entidad;
                return (
                    <div>
                        <div className="small fw-semibold">{nombreEntidad}</div>
                        {info && (
                            <Badge bg={info.bg} text={info.bg === 'warning' || info.bg === 'info' ? 'dark' : undefined} className="mt-1">
                                {info.label}
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            name: 'Fecha',
            selector: (notification) => notification.creada_en,
            sortable: true,
            minWidth: '145px',
            cell: (notification) => <span className="text-nowrap">{formatDate(notification.creada_en)}</span>,
        },
        {
            name: 'Estado',
            selector: (notification) => notification.resuelta ? 'Resuelta' : notification.leida ? 'Leída' : 'Pendiente',
            sortable: true,
            minWidth: '120px',
            cell: (notification) => (<span data-tour="estado-notificacion"> {notification.resuelta ? <Badge bg="secondary">Resuelta</Badge> : notification.leida ? <Badge bg="light" text="dark">Leída</Badge> : <Badge bg="warning" text="dark">Pendiente</Badge>}</span>),
        },
        {
            name: 'Acción',
            button: true,
            minWidth: '200px',
            cell: (notification) => (
                <div className="d-flex gap-1">
                    {notification.url && (
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => navigate(notification.url!)}
                            title="Ir al recurso"
                        >
                            <i className="bi bi-box-arrow-up-right" />
                        </Button>
                    )}
                    {!notification.leida && !notification.resuelta && (
                        <Button data-tour="btn-marcar-leida" variant="outline-primary" size="sm" onClick={() => void markRead(notification)}>
                            <i className="bi bi-check2 me-1" />Marcar leída
                        </Button>
                    )}
                </div>
            ),
        },
    ];
    const unreadRowStyles: ConditionalStyles<Notificacion>[] = [{
        when: (notification) => !notification.leida && !notification.resuelta,
        style: { backgroundColor: '#f4faf7' },
        classNames: ['notification-row-unread'],
    }];

    if (isLoading) {
        return <div className="d-flex justify-content-center py-5"><Spinner animation="border" role="status"><span className="visually-hidden">Cargando notificaciones...</span></Spinner></div>;
    }

    if (error) {
        return <Alert variant="danger">No se pudieron cargar las notificaciones. Intentá nuevamente.</Alert>;
    }

    return (
        <div className="notification-page">
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
                <div>
                    <span className="notification-eyebrow">CENTRO DE AVISOS</span>
                    <h1 className="h3 mb-1">Notificaciones</h1>
                    <p className="text-muted mb-0">Historial de novedades operativas y condiciones pendientes.</p>
                </div>
                <Badge bg="success" className="fs-6" data-tour="contador-pendientes">{(notifications ?? []).filter((notification) => !notification.leida && !notification.resuelta).length} pendientes</Badge>
            </div>

            <Card className="notification-history-card">
                <Card.Body>
                    <div className="d-flex flex-column flex-md-row gap-2 mb-3">
                        <InputGroup data-tour="buscador-notificaciones">
                            <InputGroup.Text ><i className="bi bi-search" aria-hidden="true" /></InputGroup.Text>
                            <Form.Control
                                type="search"
                                placeholder="Buscar por tipo, elemento o detalle..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                aria-label="Buscar notificaciones"
                            />
                        </InputGroup>
                        <Form.Select data-tour="filtro-notificaciones" aria-label="Filtrar notificaciones" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="notification-filter">
                            <option value="todas">Todas</option>
                            <option value="pendientes">Pendientes</option>
                            <option value="leidas">Leídas</option>
                            <option value="resueltas">Resueltas</option>
                        </Form.Select>
                    </div>

                    {(notifications ?? []).some((notification) => !notification.leida) && (
                        <div className="d-flex justify-content-end mb-3">
                            <Button data-tour="btn-marcar-todas-leidas" variant="outline-primary" size="sm" onClick={() => void markAllRead()}>
                                <i className="bi bi-check2-all me-1" />Marcar todas como leídas
                            </Button>
                        </div>
                    )}

                    <div className="notification-table" data-tour="tabla-notificaciones">
                        <AppTable
                            columns={columns}
                            data={filteredNotifications}
                            pagination={false}
                            conditionalRowStyles={unreadRowStyles}
                            noDataComponent={(
                                <div className="notification-empty-state">
                                    <i className="bi bi-bell-slash" aria-hidden="true" />
                                    <strong>No hay notificaciones para mostrar</strong>
                                    <span>Probá cambiar la búsqueda o el filtro seleccionado.</span>
                                </div>
                            )}
                        />
                    </div>
                    <div className="notification-results-count">{filteredNotifications.length} de {(notifications ?? []).length} notificaciones</div>
                </Card.Body>
            </Card>
        </div>
    );
}
