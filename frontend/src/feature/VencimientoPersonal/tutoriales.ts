import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesVencimientoPersonal: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-vencimientos-persona',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/personal/:personaId/vencimientos',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Vencimientos de la persona',
                    description: 'Acá ves los vencimientos de una persona (por ejemplo, carnets o certificados). Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('btn-volver-personal'),
                popover: {
                    title: 'Volver',
                    description: 'Te lleva de vuelta al listado de personal.',
                    side: 'bottom',
                },
            },
            {
                element: t('buscador-vencimientos-persona'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del tipo de vencimiento para filtrar la lista.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-vencimientos-persona'),
                popover: {
                    title: 'Tabla de vencimientos',
                    description: 'Cada fila es un vencimiento, con sus fechas de inicio y fin. Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('estado-vencimiento-persona'),
                popover: {
                    title: 'Estado',
                    description:
                        'Indica si el vencimiento está vigente, próximo a vencer (dentro de la antelación configurada en el sistema) o vencido, ' +
                        'con la cantidad de días correspondiente.',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-vencimiento-persona'),
                popover: {
                    title: 'Ver vencimiento',
                    description: 'Abre el detalle del vencimiento.',
                    side: 'left',
                },
            },
            {
                element: t('btn-historico-vencimiento'),
                popover: {
                    title: 'Histórico',
                    description: 'Muestra las renovaciones anteriores de ese vencimiento.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-vencimientos-persona',
        titulo: '¿Cómo administro los vencimientos?',
        ruta: '/personal/:personaId/vencimientos',
        permiso: 'administrar',
        pasos: [
            {
                element: `${t('btn-nuevo-vencimiento-persona')}:not(:disabled)`,
                popover: {
                    title: 'Crear un vencimiento',
                    description:
                        'Con este botón abrís el formulario para registrar un vencimiento nuevo a esta persona. ' +
                        'Si la persona está inactiva, el botón queda deshabilitado.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-vencimiento-persona')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del vencimiento. ' +
                        'Queda deshabilitado si la persona está inactiva.',
                    side: 'left',
                },
            },
            {
                element: `${t('btn-renovar-vencimiento')} button:not(:disabled)`,
                popover: {
                    title: 'Renovar',
                    description:
                        'Registra la renovación del vencimiento, lo que actualiza sus fechas y guarda el anterior en el histórico. ' +
                        'Queda deshabilitado si la persona está inactiva.',
                    side: 'left',
                },
            },
        ],
    },
];
export const tutorialesVencimientoConsolidado: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-vencimiento-consolidado',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/vencimiento-personal',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Vencimientos del personal',
                    description: 'Acá ves los vencimientos de todo el personal en un solo listado. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('btn-volver-consolidado'),
                popover: {
                    title: 'Volver',
                    description: 'Te lleva de vuelta al listado de personal.',
                    side: 'bottom',
                },
            },
            {
                element: t('buscador-vencimiento-consolidado'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí el nombre o apellido de la persona, o el tipo de vencimiento, para filtrar la lista.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-vencimiento-consolidado'),
                popover: {
                    title: 'Tabla de vencimientos',
                    description:
                        'Cada fila es un vencimiento de una persona. Por defecto aparecen primero los más urgentes. ' +
                        'Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('estado-vencimiento-consolidado'),
                popover: {
                    title: 'Estado',
                    description:
                        'Indica si el vencimiento está vigente, próximo a vencer (dentro de la antelación configurada) o vencido, ' +
                        'con la cantidad de días correspondiente.',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-vencimiento-consolidado'),
                popover: {
                    title: 'Ver vencimiento',
                    description: 'Abre el detalle del vencimiento.',
                    side: 'left',
                },
            },
            {
                element: t('btn-historico-consolidado'),
                popover: {
                    title: 'Histórico',
                    description: 'Muestra las renovaciones anteriores de ese vencimiento.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-vencimiento-consolidado',
        titulo: '¿Cómo administro los vencimientos?',
        ruta: '/vencimiento-personal',
        permiso: 'administrar',
        pasos: [
            {
                element: `${t('btn-editar-consolidado')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del vencimiento. ' +
                        'Queda deshabilitado si la persona está inactiva.',
                    side: 'left',
                },
            },
            {
                element: `${t('btn-renovar-consolidado')} button:not(:disabled)`,
                popover: {
                    title: 'Renovar',
                    description:
                        'Registra la renovación del vencimiento, lo que actualiza sus fechas y guarda el anterior en el histórico. ' +
                        'Queda deshabilitado si la persona está inactiva.',
                    side: 'left',
                },
            },
        ],
    },
];