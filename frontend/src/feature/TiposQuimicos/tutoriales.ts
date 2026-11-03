import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesTiposQuimicos: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-tipos-quimicos',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/tipos-quimicos',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de tipos químicos',
                    description: 'Acá están todos los tipos químicos del sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-tipos-quimicos'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre para filtrar la lista y encontrar un tipo químico rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-tipos-quimicos'),
                popover: {
                    title: 'Tabla de tipos químicos',
                    description: 'Cada fila es un tipo químico. Podés ordenar por nombre o estado haciendo clic en el encabezado de la columna.',
                    side: 'top',
                },
            },
            {
                element: t('estado-tipo-quimico'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el tipo químico está activo o inactivo (dado de baja).',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-tipo-quimico'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle del tipo químico.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-tipos-quimicos',
        titulo: '¿Cómo administro los tipos químicos?',
        ruta: '/tipos-quimicos',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-tipo-quimico'),
                popover: {
                    title: 'Crear un tipo químico',
                    description: 'Con este botón abrís el formulario para crear un tipo químico nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-tipo-quimico')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del tipo químico. ' +
                        'Si está inactivo, el botón queda deshabilitado: primero hay que darlo de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-tipo-quimico'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva un tipo químico activo, o reactiva uno inactivo. No lo borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];