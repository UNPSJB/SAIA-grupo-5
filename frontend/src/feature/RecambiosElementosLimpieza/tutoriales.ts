import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesRecambiosElementosLimpieza: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-recambios-elementos-limpieza',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/recambios-elementos-limpieza',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Recambios de elementos de limpieza',
                    description: 'Acá está el registro de los recambios realizados a los elementos de limpieza. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-recambios'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del código o nombre del elemento, la fecha o la observación para encontrar un recambio rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-recambios'),
                popover: {
                    title: 'Tabla de recambios',
                    description: 'Cada fila es un recambio, con el elemento, su código, la fecha y una observación. Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('btn-ver-recambio'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle del recambio.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-recambios-elementos-limpieza',
        titulo: '¿Cómo registro un recambio?',
        ruta: '/recambios-elementos-limpieza',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-recambio'),
                popover: {
                    title: 'Registrar un recambio',
                    description:
                        'Con este botón abrís el formulario para registrar un recambio nuevo. ' +
                        'También podés hacerlo desde el botón "Recambio" de cada elemento en el listado de Elementos de Limpieza.',
                    side: 'bottom',
                },
            },
        ],
    },
];