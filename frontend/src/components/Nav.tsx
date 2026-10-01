import { useMemo, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import './Nav.css';

interface NavItem {
    label: string;
    to: string;
    icon: string;
    adminOnly?: boolean;
}

interface NavGroup {
    id: string;
    label: string;
    icon: string;
    items: NavItem[];
    adminOnly?: boolean;
}

const navGroups: NavGroup[] = [
    {
        id: 'operaciones',
        label: 'Operaciones',
        icon: 'bi-clipboard2-check',
        items: [
            { label: 'Tareas', to: '/tareas', icon: 'bi-list-check' },
            { label: 'Checklist', to: '/checklist', icon: 'bi-check2-square' },
            { label: 'Historial', to: '/historial', icon: 'bi-clock-history', adminOnly: true },
        ],
    },
    {
        id: 'gestion',
        label: 'Gestión',
        icon: 'bi-grid',
        items: [
            { label: 'Insumos', to: '/insumos', icon: 'bi-box-seam' },
            { label: 'Insumos químicos', to: '/insumos-quimicos', icon: 'bi-droplet' },
            { label: 'Equipos', to: '/equipos', icon: 'bi-tools' },
            { label: 'Elementos de limpieza', to: '/elementos-limpieza', icon: 'bi-bucket' },
            { label: 'Recambios', to: '/recambios-elementos-limpieza', icon: 'bi-arrow-repeat' },
            { label: 'Planes de limpieza', to: '/planes-limpieza', icon: 'bi-clipboard-check' },
            { label: 'Superficies', to: '/superficies', icon: 'bi-virus2' },
            { label: 'Personal', to: '/personal', icon: 'bi-people', adminOnly: true },
            { label: 'Consulta de consumo', to: '/consumos-productos/consulta', icon: 'bi-droplet-half', adminOnly: true },
        ],
    },
    {
        id: 'datos-maestros',
        label: 'Datos maestros',
        icon: 'bi-database',
        adminOnly: true,
        items: [
            { label: 'Sectores', to: '/sectores', icon: 'bi-geo-alt' },
            { label: 'Tipos de elementos', to: '/tipos-elementos-limpieza', icon: 'bi-tags' },
            { label: 'Tipos de químicos', to: '/tipos-quimicos', icon: 'bi-flask' },
        ],
    },
];

function isPathActive(pathname: string, to: string) {
    return pathname === to || pathname.startsWith(`${to}/`);
}

export function Nav({ children }: { children: React.ReactNode }) {
    const { currentUser, logout } = useAuth();
    const location = useLocation();
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

    const closeMobileMenu = () => setMenuState({
        pathname: location.pathname,
        expandedGroup,
        mobileMenuOpen: false,
    });

    const displayName = `${currentUser?.nombre ?? ''} ${currentUser?.apellido ?? ''}`.trim() || currentUser?.username || 'Usuario';
    const email = currentUser?.mail || currentUser?.email || '';

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
                        <span className="sb-topbar-title">Sistema de gestión</span>
                    </div>

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
                </header>

                <main className="sb-page-content">{children}</main>
            </div>
        </div>
    );
}
