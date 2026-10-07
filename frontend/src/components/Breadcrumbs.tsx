import { Fragment, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navGroups } from './navGroups';

const APP_ROOT = { label: 'Sistema de gestión', to: '/' };

// Etiquetas de rutas que no figuran en el menú lateral o que son secciones padre.
const PATH_LABELS: Record<string, string> = {
    '/consumos-productos': 'Consumos de productos',
    '/tareas-ocurrencia': 'Historial',
    '/vencimiento-personal': 'Vencimientos de personal',
    '/notificaciones': 'Notificaciones',
};

// Etiquetas de segmentos finales de acción (new, edit, vencimientos, etc.).
const SEGMENT_LABELS: Record<string, string> = {
    new: 'Nuevo',
    edit: 'Editar',
    vencimientos: 'Vencimientos',
};

function etiquetaDesdeMenu(to: string): string | undefined {
    for (const group of navGroups) {
        const item = group.items.find((navItem) => navItem.to === to);
        if (item) return item.label;
    }
    return undefined;
}

function capitalizar(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

type Crumb = { label: string; to: string };

function construirCrumbdes(pathname: string): Crumb[] {
    if (pathname === APP_ROOT.to) return [];

    const segmentos = pathname.split('/').filter(Boolean);
    const crumbdes: Crumb[] = [];
    let rutaAcumulada = '';

    for (const segmento of segmentos) {
        rutaAcumulada += `/${segmento}`;
        // Los ids numéricos no aportan nada visual al breadcrumb.
        if (/^\d+$/.test(segmento)) continue;

        const label =
            etiquetaDesdeMenu(rutaAcumulada) ??
            PATH_LABELS[rutaAcumulada] ??
            SEGMENT_LABELS[segmento] ??
            capitalizar(segmento.replaceAll('-', ' '));

        crumbdes.push({ label, to: rutaAcumulada });
    }

    return crumbdes;
}

export function Breadcrumbs() {
    const { pathname } = useLocation();
    const crumbdes = useMemo(() => construirCrumbdes(pathname), [pathname]);

    return (
        <nav className="sb-breadcrumbs" aria-label="Miga de pan">
            <ol className="sb-breadcrumbs-list">
                <li>
                    {crumbdes.length === 0 ? (
                        <span className="sb-breadcrumb-current" aria-current="page">{APP_ROOT.label}</span>
                    ) : (
                        <Link className="sb-breadcrumb-root" to={APP_ROOT.to}>{APP_ROOT.label}</Link>
                    )}
                </li>
                {crumbdes.map((crumb, index) => {
                    const esUltimo = index === crumbdes.length - 1;
                    return (
                        <Fragment key={crumb.to}>
                            <li className="sb-breadcrumb-separator" aria-hidden="true">/</li>
                            <li
                                className={esUltimo ? 'sb-breadcrumb-current' : undefined}
                                aria-current={esUltimo ? 'page' : undefined}
                            >
                                {esUltimo ? (
                                    crumb.label
                                ) : (
                                    <Link className="sb-breadcrumb-link" to={crumb.to}>{crumb.label}</Link>
                                )}
                            </li>
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}
