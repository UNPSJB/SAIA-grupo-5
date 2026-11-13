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
        id: 'gestion',
        label: 'Gestión',
        icon: 'bi-grid',
        items: [
            { label: 'Personal', to: '/personal', icon: 'bi-people', adminOnly: true },
            { label: 'Documentos', to: '/documentos', icon: 'bi-file-text' },
            { label: 'Clientes', to: '/clientes', icon: 'bi bi-shop', adminOnly: true }
        ],
    },
    {
        id: 'operaciones',
        label: 'Operaciones',
        icon: 'bi-clipboard2-check',
        items: [
            { label: 'Tareas', to: '/tareas', icon: 'bi-list-check' },
            { label: 'Checklist', to: '/checklist', icon: 'bi-check2-square' },
            { label: 'Incidentes', to: '/incidentes', icon: 'bi-exclamation-diamond'},
        ],
    },
    {
        id: 'limpieza',
        label: 'Limpieza',
        icon: 'bi-stars',
        items: [
            { label: 'Planes de Limpieza', to: '/planes-limpieza', icon: 'bi-clipboard-check' },
            { label: 'Insumos Químicos', to: '/insumos-quimicos', icon: 'bi-droplet' },
            { label: 'Consulta de Consumos', to: '/consumos-productos/consulta', icon: 'bi-droplet-half', adminOnly: true },
            { label: 'Elementos de Limpieza', to: '/elementos-limpieza', icon: 'bi-bucket' },
            { label: 'Recambios', to: '/recambios-elementos-limpieza', icon: 'bi-arrow-repeat' }
        ],
    },
    {
        id: 'mantenimiento',
        label: 'Mantenimiento',
        icon: 'bi-wrench',
        items: [
            { label: 'Equipos', to: '/equipos', icon: 'bi-tools' },
            { label: 'Planes de Calibracion', to: '/planes-calibracion', icon: 'bi-gear' }
        ],
    },
    {
        id: 'produccion',
        label: 'Producción',
        icon: 'bi-boxes',
        items: [
            { label: 'Insumos', to: '/insumos', icon: 'bi-box-seam' },
            { label: 'Productos', to: '/productos', icon: 'bi bi-fork-knife'},
            { label: 'Lotes de Produccion', to: '/lotes-produccion', icon: 'bi bi-box2-fill'}
        ],
    },
    {
        id: 'abastecimiento',
        label: 'Abastecimiento',
        icon: 'bi-box-arrow-in-down',
        items: [
            { label: 'Proveedores', to: '/proveedores', icon: 'bi bi-cart', adminOnly: true },
            { label: 'Recepciones', to: '/recepciones', icon: 'bi bi-truck'},
            { label: 'Insumos Alimenticios', to: '/insumos-lote', icon: 'bi bi-egg'}
        ],
    },
    {
        id: 'historiales',
        label: 'Historiales',
        icon: 'bi-clock-history',
        adminOnly: true,
        items: [
            { label: 'Checklist', to: '/historial', icon: 'bi-check2-square', adminOnly: true },
            { label: 'Incidentes', to: '/incidentes-historial', icon: 'bi-exclamation-diamond', adminOnly: true },
            { label: 'Lotes', to: '/lotes-historial', icon: 'bi-boxes', adminOnly: true }
        ],
    },
    {
        id: 'datos-maestros',
        label: 'Datos maestros',
        icon: 'bi-database',
        adminOnly: true,
        items: [
            { label: 'Tipos de Vencimientos', to: '/tipos-vencimientos', icon: 'bi-calendar-plus'},
            { label: 'Tipos de Documentos', to: '/tipos-documentos', icon: 'bi bi-file-earmark-text'},
            { label: 'Tipos de Incidentes', to: '/tipos-incidentes', icon: 'bi-exclamation-triangle'},
            { label: 'Sectores', to: '/sectores', icon: 'bi-geo-alt' },
            { label: 'Superficies', to: '/superficies', icon: 'bi-virus2' },
            { label: 'Tipos de Químicos', to: '/tipos-quimicos', icon: 'bi-flask' },
            { label: 'Tipos de Elementos', to: '/tipos-elementos-limpieza', icon: 'bi-tags' },
            { label: 'Unidades de Medida', to: '/unidades-medida', icon: 'bi bi-rulers'},
            { label: 'Aditivos', to: '/aditivos', icon: 'bi-eyedropper' }
        ],
    },
];
