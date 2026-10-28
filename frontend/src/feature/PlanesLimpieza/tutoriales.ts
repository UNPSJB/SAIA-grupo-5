import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesPlanesLimpieza: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-planes-limpieza',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/planes-limpieza',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de planes de limpieza',
                    description: 'Acá están todos los planes de limpieza del sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-planes-limpieza'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre para filtrar la lista y encontrar un plan rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-planes-limpieza'),
                popover: {
                    title: 'Tabla de planes',
                    description: 'Cada fila es un plan de limpieza. Podés ordenar por nombre o estado haciendo clic en el encabezado de la columna.',
                    side: 'top',
                },
            },
            {
                element: t('btn-ver-descripcion-plan'),
                popover: {
                    title: 'Descripción',
                    description: 'Abre una ventana con la descripción del plan de limpieza.',
                    side: 'left',
                },
            },
            {
                element: `${t('btn-ver-tareas-plan')}:not(:disabled)`,
                popover: {
                    title: 'Tareas del plan',
                    description:
                        'Te lleva a la pantalla de Tareas con este plan ya seleccionado. ' +
                        'Si el plan está inactivo, el botón queda deshabilitado.',
                    side: 'left',
                },
            },
            {
                element: t('estado-plan-limpieza'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el plan está activo o inactivo (dado de baja).',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-planes-limpieza',
        titulo: '¿Cómo administro los planes de limpieza?',
        ruta: '/planes-limpieza',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-plan-limpieza'),
                popover: {
                    title: 'Crear un plan',
                    description: 'Con este botón abrís el formulario para crear un plan de limpieza nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-plan-limpieza')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del plan. ' +
                        'Si está inactivo, el botón queda deshabilitado: primero hay que darlo de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-plan-limpieza'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva un plan activo, o reactiva uno inactivo. No lo borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];