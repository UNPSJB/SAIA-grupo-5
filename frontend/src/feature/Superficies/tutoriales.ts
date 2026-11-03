import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesSuperficies: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-superficies',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/superficies',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de superficies',
                    description: 'Acá están todas las superficies del sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-superficies'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre o del tipo de contacto para filtrar la lista y encontrar una superficie rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-superficies'),
                popover: {
                    title: 'Tabla de superficies',
                    description: 'Cada fila es una superficie, con su tipo de contacto. Podés ordenar por nombre, tipo de contacto o estado haciendo clic en el encabezado de la columna.',
                    side: 'top',
                },
            },
            {
                element: t('btn-ver-sectores-superficie'),
                popover: {
                    title: 'Ver sectores',
                    description: 'Abre una ventana con los sectores a los que pertenece esa superficie.',
                    side: 'left',
                },
            },
            {
                element: t('estado-superficie'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si la superficie está activa o inactiva (dada de baja).',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-superficies',
        titulo: '¿Cómo administro las superficies?',
        ruta: '/superficies',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nueva-superficie'),
                popover: {
                    title: 'Crear una superficie',
                    description: 'Con este botón abrís el formulario para crear una superficie nueva.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-superficie')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos de la superficie. ' +
                        'Si está inactiva, el botón queda deshabilitado: primero hay que darla de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-superficie'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva una superficie activa, o reactiva una inactiva. No se borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];