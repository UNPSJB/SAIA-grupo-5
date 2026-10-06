import { useEffect, useMemo, useState } from 'react';
import { Badge, Dropdown } from 'react-bootstrap';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { mutate } from 'swr';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks';
import { api } from '../libs/axios';
import type { Notificacion } from '../feature/Notificaciones/types';
import { navGroups } from './navGroups';
import { Breadcrumbs } from './Breadcrumbs';
import './Nav.css';

function isPathActive(pathname: string, to: string) {
    return pathname === to || pathname.startsWith(`${to}/`);
}

export function Nav({ children }: { children: React.ReactNode }) {
    const { currentUser, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isAdmin = Boolean(currentUser?.administrar);
    const { data: notifications } = useApi<Notificacion[]>(isAdmin ? '/notificaciones/' : null);
    const [menuState, setMenuState] = useState({
        pathname: location.pathname,
        expandedGroup: null as string | null,
        mobileMenuOpen: false,
    });
    const visibleGroups = useMemo(
        () => navGroups
            .filter((group) => !group.adminOnly || currentUser?.administrar)
            .map((group) => ({
                ...group,
                items: group.items.filter((item) => !item.adminOnly || currentUser?.administrar),
            })),
        [currentUser?.administrar],
    );

    const activeGroupId = visibleGroups.find((group) =>
        group.items.some((item) => isPathActive(location.pathname, item.to)),
    )?.id ?? null;
    const routeChanged = menuState.pathname !== location.pathname;
    const expandedGroup = routeChanged ? activeGroupId : menuState.expandedGroup;
    const mobileMenuOpen = !routeChanged && menuState.mobileMenuOpen;

    useEffect(() => {
        if (!isAdmin) return undefined;
        const interval = window.setInterval(() => void mutate('/notificaciones/'), 30_000);
        return () => window.clearInterval(interval);
    }, [isAdmin]);

    const closeMobileMenu = () => setMenuState({
        pathname: location.pathname,
        expandedGroup,
        mobileMenuOpen: false,
    });

    const displayName = `${currentUser?.nombre ?? ''} ${currentUser?.apellido ?? ''}`.trim() || currentUser?.username || 'Usuario';
    const email = currentUser?.mail || currentUser?.email || '';
    const pendingNotifications = (notifications ?? []).filter((notification) => !notification.leida && !notification.resuelta);
    const recentNotifications = (notifications ?? []).filter((notification) => !notification.resuelta).slice(0, 5);

    const openNotification = async (notification: Notificacion) => {
        if (!notification.leida) {
            await api.patch(`/notificaciones/${notification.id}/leida`);
            await mutate('/notificaciones/');
        }
        if (notification.url) navigate(notification.url);
    };

    const openNotificationHistory = () => {
        navigate('/notificaciones', { state: { fromBell: true } });
    };

    return (
        <div className="sb-app-shell">
            {mobileMenuOpen && (
                <button
                    type="button"
                    className="sb-sidebar-backdrop"
                    aria-label="Cerrar menú de navegación"
                    onClick={closeMobileMenu}
                />
            )}

            <aside className={`sb-sidebar${mobileMenuOpen ? ' is-open' : ''}`}>

                <div className="sb-sidebar-content">
                    <span className="sb-section-label">INICIO</span>
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `sb-nav-link${isActive ? ' active' : ''}`}
                        onClick={closeMobileMenu}
                    >
                        <i className="bi bi-speedometer2" />
                        <span>Panel principal</span>
                    </NavLink>

                    <span className="sb-section-label sb-section-spaced">GESTIÓN DEL SISTEMA</span>
                    {visibleGroups.map((group) => {
                        const isOpen = expandedGroup === group.id;
                        const groupIsActive = group.items.some((item) => isPathActive(location.pathname, item.to));
                        return (
                            <div className="sb-nav-group" key={group.id}>
                                <button
                                    type="button"
                                    className={`sb-nav-link sb-nav-group-toggle${groupIsActive ? ' active' : ''}`}
                                    aria-expanded={isOpen}
                                    aria-controls={`sb-group-${group.id}`}
                                    onClick={() => setMenuState({
                                        pathname: location.pathname,
                                        expandedGroup: isOpen ? null : group.id,
                                        mobileMenuOpen,
                                    })}
                                >
                                    <i className={`bi ${group.icon}`} />
                                    <span>{group.label}</span>
                                    <i className={`bi bi-chevron-${isOpen ? 'down' : 'right'} sb-chevron`} />
                                </button>
                                {isOpen && (
                                    <div className="sb-subnav" id={`sb-group-${group.id}`}>
                                        {group.items.map((item) => (
                                            <NavLink
                                                to={item.to}
                                                key={item.to}
                                                className={({ isActive }) => `sb-nav-link sb-subnav-link${isActive || isPathActive(location.pathname, item.to) ? ' active' : ''}`}
                                                onClick={closeMobileMenu}
                                            >
                                                <i className={`bi ${item.icon}`} />
                                                <span>{item.label}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="sb-sidebar-footer">
                    <span className="sb-sidebar-footer-icon"><i className="bi bi-shield-check" /></span>
                    <span><strong>SAIA-5</strong><small>Gestión de inocuidad</small></span>
                </div>
            </aside>

            <div className="sb-main">
                <header className="sb-topbar">
                    <div className="d-flex align-items-center gap-3">
                        <button
                            type="button"
                            className="sb-menu-toggle"
                            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                            aria-expanded={mobileMenuOpen}
                            onClick={() => setMenuState({
                                pathname: location.pathname,
                                expandedGroup,
                                mobileMenuOpen: !mobileMenuOpen,
                            })}
                        >
                            <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'}`} />
                        </button>
                        <Breadcrumbs />
                    </div>

                    <div className="sb-topbar-actions">
                        {isAdmin && (
                            <Dropdown align="end" className="sb-notification-dropdown">
                                <Dropdown.Toggle as="button" id="sb-notification-menu" className="sb-notification-toggle" aria-label={`Notificaciones: ${pendingNotifications.length} pendientes`}>
                                    <i className="bi bi-bell" aria-hidden="true" />
                                    {pendingNotifications.length > 0 && (
                                        <Badge bg="danger" pill className="sb-notification-count">
                                            {pendingNotifications.length > 99 ? '99+' : pendingNotifications.length}
                                        </Badge>
                                    )}
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="sb-notification-menu">
                                    <div className="sb-notification-heading">
                                        <strong>Notificaciones</strong>
                                        <span>{pendingNotifications.length} pendientes</span>
                                    </div>
                                    <div className="sb-notification-list">
                                        {recentNotifications.length === 0 ? (
                                            <div className="sb-notification-empty">No hay notificaciones recientes.</div>
                                        ) : recentNotifications.map((notification) => (
                                            <button
                                                type="button"
                                                className={`sb-notification-item${notification.leida ? ' is-read' : ''}`}
                                                key={notification.id}
                                                onClick={() => void openNotification(notification)}
                                            >
                                                <span className="sb-notification-dot" />
                                                <span className="sb-notification-copy">
                                                    <strong>{notification.titulo}</strong>
                                                    <span>{notification.entidad}</span>
                                                    <small>{notification.descripcion}</small>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <Dropdown.Divider />
                                    <Dropdown.Item as="button" onClick={openNotificationHistory} className="sb-notification-all">
                                        Ver todas las notificaciones <i className="bi bi-arrow-right" />
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        )}
                        <Dropdown align="end">
                            <Dropdown.Toggle as="button" id="sb-account-menu" className="sb-account-toggle">
                                <span className="sb-avatar" aria-hidden="true"><i className="bi bi-person-fill" /></span>
                                <span className="sb-account-name">{displayName}</span>
                                <i className="bi bi-chevron-down sb-account-chevron" aria-hidden="true" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="sb-account-menu">
                                <div className="sb-account-summary">
                                    <strong>{displayName}</strong>
                                    <span>{email}</span>
                                </div>
                                <Dropdown.Divider />
                                <Dropdown.Item as="button" onClick={(event) => event.preventDefault()}>
                                    <i className="bi bi-gear me-2" />Configuración de cuenta
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item as="button" onClick={() => void logout()}>
                                    <i className="bi bi-box-arrow-right me-2" />Cerrar sesión
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </header>

                <main className="sb-page-content">{children}</main>
            </div>
        </div>
    );
}
