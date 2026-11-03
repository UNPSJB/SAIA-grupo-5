import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesIncidentesHistorial: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-incidentes-historial',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/incidentes-historial',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Historial de incidentes',
                    description: 'Acá podés revisar los incidentes registrados y filtrarlos por período y tipo. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('filtros-historial-incidentes'),
                popover: {
                    title: 'Fechas y tipo de incidente',
                    description:
                        'Elegí desde y hasta qué fecha querés ver los incidentes, y opcionalmente un tipo. ' +
                        'La fecha "Desde" no puede ser posterior a "Hasta".',
                    side: 'bottom',
                },
            },
            {
                element: t('resumen-historial-incidentes'),
                popover: {
                    title: 'Resumen del período',
                    description:
                        'Muestra el total de incidentes, cuántos están abiertos y cerrados, y el porcentaje de resueltos. ' +
                        'Los números respetan las fechas y el tipo elegidos, y solo cuentan incidentes activos.',
                    side: 'bottom',
                },
            },
            {
                element: t('filtro-estado-historial-incidentes'),
                popover: {
                    title: 'Filtrar por estado',
                    description: 'Permite ver todos los incidentes, solo los abiertos o solo los cerrados.',
                    side: 'bottom',
                },
            },
            {
                element: t('buscador-historial-incidentes'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre, la descripción o quién lo reportó para encontrar un incidente rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-historial-incidentes'),
                popover: {
                    title: 'Tabla de incidentes',
                    description:
                        'Cada fila es un incidente. Podés ordenar por cualquier columna haciendo clic en su encabezado. ' +
                        'Los demorados se marcan con una advertencia en "Días abierto".',
                    side: 'top',
                },
            },
            {
                element: t('estado-historial-incidente'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el incidente está abierto o cerrado.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-incidentes-historial',
        titulo: '¿Cómo veo el detalle de un incidente?',
        ruta: '/incidentes-historial',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-historial-incidente-hist'),
                popover: {
                    title: 'Ver historial',
                    description: 'Abre el historial del incidente, con las acciones correctivas y reaperturas registradas.',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-incidente-hist'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle completo del incidente. Desde ahí podés volver a esta pantalla.',
                    side: 'left',
                },
            },
        ],
    },
];