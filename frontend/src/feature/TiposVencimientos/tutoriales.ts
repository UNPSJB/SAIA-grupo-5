import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesTiposVencimientos: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-tipos-vencimientos',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/tipos-vencimientos',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de tipos de vencimientos',
                    description: 'Acá están todos los tipos de vencimientos del sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-tipos-vencimientos'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre para filtrar la lista y encontrar un tipo de vencimiento rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-tipos-vencimientos'),
                popover: {
                    title: 'Tabla de tipos de vencimientos',
                    description: 'Cada fila es un tipo de vencimiento. Podés ordenar por nombre o estado haciendo clic en el encabezado de la columna.',
                    side: 'top',
                },
            },
            {
                element: t('estado-tipo-vencimiento'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el tipo de vencimiento está activo o inactivo (dado de baja).',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-tipo-vencimiento'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle del tipo de vencimiento.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-tipos-vencimientos',
        titulo: '¿Cómo administro los tipos de vencimientos?',
        ruta: '/tipos-vencimientos',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-tipo-vencimiento'),
                popover: {
                    title: 'Crear un tipo de vencimiento',
                    description: 'Con este botón abrís el formulario para crear un tipo de vencimiento nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-tipo-vencimiento')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del tipo de vencimiento. ' +
                        'Si está inactivo, el botón queda deshabilitado: primero hay que darlo de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-tipo-vencimiento'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva un tipo de vencimiento activo, o reactiva uno inactivo. No lo borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];