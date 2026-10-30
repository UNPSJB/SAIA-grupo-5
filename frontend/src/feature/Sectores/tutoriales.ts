import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesSectores: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-sectores',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/sectores',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de sectores',
                    description: 'Acá están todos los sectores del sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-sectores'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre para filtrar la lista y encontrar un sector rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-sectores'),
                popover: {
                    title: 'Tabla de sectores',
                    description: 'Cada fila es un sector. Podés ordenar por ID, nombre o estado haciendo clic en el encabezado de la columna.',
                    side: 'top',
                },
            },
            {
                element: t('btn-ver-equipos-sector'),
                popover: {
                    title: 'Ver equipos',
                    description: 'Abre una ventana con los equipos que pertenecen a ese sector.',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-superficies-sector'),
                popover: {
                    title: 'Ver superficies',
                    description: 'Abre una ventana con las superficies que pertenecen a ese sector.',
                    side: 'left',
                },
            },
            {
                element: t('estado-sector'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el sector está activo o inactivo (dado de baja).',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-sectores',
        titulo: '¿Cómo administro los sectores?',
        ruta: '/sectores',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-sector'),
                popover: {
                    title: 'Crear un sector',
                    description: 'Con este botón abrís el formulario para crear un sector nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-sector')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del sector. ' +
                        'Si está inactivo, el botón queda deshabilitado: primero hay que darlo de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-sector'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva un sector activo, o reactiva uno inactivo. No lo borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];