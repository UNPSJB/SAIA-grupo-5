import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesProductos: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-productos',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/productos',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de productos',
                    description: 'Acá están todos los productos del sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-productos'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre para filtrar la lista y encontrar un producto rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-productos'),
                popover: {
                    title: 'Tabla de productos',
                    description:
                        'Cada fila es un producto, con su unidad de medida, cantidad neta y fecha de lanzamiento. ' +
                        'Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('unidad-medida-producto'),
                popover: {
                    title: 'Unidad de medida',
                    description: 'Indica en qué unidad se mide la cantidad neta del producto.',
                    side: 'left',
                },
            },
            {
                element: t('estado-producto'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el producto está vigente o descontinuado (dado de baja).',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-producto'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle del producto.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-productos',
        titulo: '¿Cómo administro los productos?',
        ruta: '/productos',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-producto'),
                popover: {
                    title: 'Crear un producto',
                    description: 'Con este botón abrís el formulario para crear un producto nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-producto')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del producto. ' +
                        'Si está descontinuado, el botón queda deshabilitado: primero hay que darlo de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-producto'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Descontinúa un producto vigente, o reactiva uno descontinuado. No lo borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];