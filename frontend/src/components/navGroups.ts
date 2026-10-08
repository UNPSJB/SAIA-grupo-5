export interface NavItem {
    label: string;
    to: string;
    icon: string;
    adminOnly?: boolean;
}

export interface NavGroup {
    id: string;
    label: string;
    icon: string;
    items: NavItem[];
    adminOnly?: boolean;
}

export const navGroups: NavGroup[] = [
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
            { label: 'Documentos', to: '/documentos', icon: 'bi-file-text' },
            { label: 'Recambios', to: '/recambios-elementos-limpieza', icon: 'bi-arrow-repeat' },
            { label: 'Planes de calibracion', to: '/planes-calibracion', icon: 'bi-tools' },
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
            { label: 'Tipos de Documentos', to: '/tipos-documentos', icon: 'bi-file-earmark-text' },
            { label: 'Tipos de Vencimientos', to: '/tipos-vencimientos', icon: 'bi-calendar-plus'}
        ],
    },
];
