import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesInsumosQuimicos: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-insumos-quimicos',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/insumos-quimicos',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de insumos químicos',
                    description: 'Acá están todos los insumos químicos del sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-insumos-quimicos'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre, la unidad de medida o el tipo de químico para filtrar la lista y encontrar un insumo rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-insumos-quimicos'),
                popover: {
                    title: 'Tabla de insumos químicos',
                    description: 'Cada fila es un insumo químico. Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('tipo-insumo-quimico'),
                popover: {
                    title: 'Tipo de químico',
                    description: 'Indica la clasificación del insumo químico.',
                    side: 'left',
                },
            },
            {
                element: t('unidad-medida-insumo-quimico'),
                popover: {
                    title: 'Unidad de medida',
                    description: 'Indica en qué unidad se mide el insumo.',
                    side: 'left',
                },
            },
            {
                element: t('estado-insumo-quimico'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el insumo químico está activo o inactivo (dado de baja).',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-insumo-quimico'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle del insumo químico.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-insumos-quimicos',
        titulo: '¿Cómo administro los insumos químicos?',
        ruta: '/insumos-quimicos',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-insumo-quimico'),
                popover: {
                    title: 'Crear un insumo químico',
                    description: 'Con este botón abrís el formulario para crear un insumo químico nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-insumo-quimico')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del insumo químico. ' +
                        'Si está inactivo, el botón queda deshabilitado: primero hay que darlo de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-insumo-quimico'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva un insumo químico activo, o reactiva uno inactivo. No lo borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];