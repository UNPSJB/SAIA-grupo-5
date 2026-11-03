import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesEquipos: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-equipos',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/equipos',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de equipos',
                    description: 'Acá están todos los equipos del sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-equipos'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre, la categoría o la ubicación para filtrar la lista y encontrar un equipo rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-equipos'),
                popover: {
                    title: 'Tabla de equipos',
                    description: 'Cada fila es un equipo, con su categoría y el sector al que pertenece. Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('estado-equipo'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el equipo está activo o inactivo (dado de baja).',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-equipos',
        titulo: '¿Cómo administro los equipos?',
        ruta: '/equipos',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-equipo'),
                popover: {
                    title: 'Crear un equipo',
                    description: 'Con este botón abrís el formulario para crear un equipo nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-equipo')}:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del equipo. ' +
                        'Si el equipo está inactivo, el botón queda deshabilitado.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-equipo'),
                popover: {
                    title: 'Dar de baja',
                    description:
                        'Desactiva un equipo activo. ' +
                        'Este botón solo aparece en equipos activos.',
                    side: 'left',
                },
            },
        ],
    },
];