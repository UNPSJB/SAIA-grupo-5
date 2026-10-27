import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesInsumos: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-insumos',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/insumos',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de insumos',
                    description: 'Acá están todos los insumos del sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-insumos'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre o de la unidad de medida para filtrar la lista y encontrar un insumo rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-insumos'),
                popover: {
                    title: 'Tabla de insumos',
                    description: 'Cada fila es un insumo. Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('unidad-medida-insumo'),
                popover: {
                    title: 'Unidad de medida',
                    description: 'Indica en qué unidad se mide el insumo (por ejemplo litros, kilos o unidades).',
                    side: 'left',
                },
            },
            {
                element: t('estado-insumo'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el insumo está activo o inactivo (dado de baja).',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-insumo'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle del insumo.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-insumos',
        titulo: '¿Cómo administro los insumos?',
        ruta: '/insumos',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-insumo'),
                popover: {
                    title: 'Crear un insumo',
                    description: 'Con este botón abrís el formulario para crear un insumo nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-insumo')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del insumo. ' +
                        'Si el insumo está inactivo, el botón queda deshabilitado: primero hay que darlo de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-insumo'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva un insumo activo, o reactiva uno inactivo. No lo borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];