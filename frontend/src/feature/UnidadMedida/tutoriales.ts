import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesUnidadesMedida: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-unidades-medida',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/unidades-medida',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de unidades de medida',
                    description: 'Acá están todas las unidades de medida del sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-unidades-medida'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre para filtrar la lista y encontrar una unidad de medida rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-unidades-medida'),
                popover: {
                    title: 'Tabla de unidades de medida',
                    description: 'Cada fila es una unidad de medida. Podés ordenar por nombre o estado haciendo clic en el encabezado de la columna.',
                    side: 'top',
                },
            },
            {
                element: t('estado-unidad-medida'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si la unidad de medida está activa o inactiva (dada de baja).',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-unidad-medida'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle de la unidad de medida.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-unidades-medida',
        titulo: '¿Cómo administro las unidades de medida?',
        ruta: '/unidades-medida',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nueva-unidad-medida'),
                popover: {
                    title: 'Crear una unidad de medida',
                    description: 'Con este botón abrís el formulario para crear una unidad de medida nueva.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-unidad-medida')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos de la unidad de medida. ' +
                        'Si está inactiva, el botón queda deshabilitado: primero hay que darla de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-unidad-medida'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva una unidad de medida activa, o reactiva una inactiva. No se borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];