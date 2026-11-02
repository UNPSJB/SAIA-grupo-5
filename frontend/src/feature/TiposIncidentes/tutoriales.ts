import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesTiposIncidentes: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-tipos-incidentes',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/tipos-incidentes',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de tipos de incidentes',
                    description: 'Acá están todos los tipos de incidentes del sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-tipos-incidentes'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre para filtrar la lista y encontrar un tipo de incidente rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-tipos-incidentes'),
                popover: {
                    title: 'Tabla de tipos de incidentes',
                    description: 'Cada fila es un tipo de incidente. Podés ordenar por nombre o estado haciendo clic en el encabezado de la columna.',
                    side: 'top',
                },
            },
            {
                element: t('estado-tipo-incidente'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el tipo de incidente está activo o inactivo (dado de baja).',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-tipo-incidente'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle del tipo de incidente.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-tipos-incidentes',
        titulo: '¿Cómo administro los tipos de incidentes?',
        ruta: '/tipos-incidentes',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-tipo-incidente'),
                popover: {
                    title: 'Crear un tipo de incidente',
                    description: 'Con este botón abrís el formulario para crear un tipo de incidente nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-tipo-incidente')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del tipo de incidente. ' +
                        'Si está inactivo, el botón queda deshabilitado: primero hay que darlo de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-tipo-incidente'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva un tipo de incidente activo, o reactiva uno inactivo. No lo borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];