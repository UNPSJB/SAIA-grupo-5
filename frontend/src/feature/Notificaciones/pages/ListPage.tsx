import { useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Form, InputGroup, Spinner } from 'react-bootstrap';
import { type ConditionalStyles, type TableColumn } from 'react-data-table-component';
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

export function NotificacionesPage() {
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
            selector: (notification) => notification.entidad,
            sortable: true,
            minWidth: '160px',
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
            cell: (notification) => notification.resuelta ? <Badge bg="secondary">Resuelta</Badge> : notification.leida ? <Badge bg="light" text="dark">Leída</Badge> : <Badge bg="warning" text="dark">Pendiente</Badge>,
        },
        {
            name: 'Acción',
            button: true,
            minWidth: '145px',
            cell: (notification) => !notification.leida && !notification.resuelta ? (
                <Button variant="outline-primary" size="sm" onClick={() => void markRead(notification)}>
                    <i className="bi bi-check2 me-1" />Marcar leída
                </Button>
            ) : null,
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
                <Badge bg="success" className="fs-6">{(notifications ?? []).filter((notification) => !notification.leida && !notification.resuelta).length} pendientes</Badge>
            </div>

            <Card className="notification-history-card">
                <Card.Body>
                    <div className="d-flex flex-column flex-md-row gap-2 mb-3">
                        <InputGroup>
                            <InputGroup.Text><i className="bi bi-search" aria-hidden="true" /></InputGroup.Text>
                            <Form.Control
                                type="search"
                                placeholder="Buscar por tipo, elemento o detalle..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                aria-label="Buscar notificaciones"
                            />
                        </InputGroup>
                        <Form.Select aria-label="Filtrar notificaciones" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="notification-filter">
                            <option value="todas">Todas</option>
                            <option value="pendientes">Pendientes</option>
                            <option value="leidas">Leídas</option>
                            <option value="resueltas">Resueltas</option>
                        </Form.Select>
                    </div>

                    {(notifications ?? []).some((notification) => !notification.leida) && (
                        <div className="d-flex justify-content-end mb-3">
                            <Button variant="outline-primary" size="sm" onClick={() => void markAllRead()}>
                                <i className="bi bi-check2-all me-1" />Marcar todas como leídas
                            </Button>
                        </div>
                    )}

                    <div className="notification-table">
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
