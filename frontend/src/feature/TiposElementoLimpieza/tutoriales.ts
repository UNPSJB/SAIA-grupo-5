import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesTiposElementoLimpieza: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-tipos-elemento-limpieza',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/tipos-elementos-limpieza',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Tipos de elementos de limpieza',
                    description: 'Acá están los tipos con los que se clasifican los elementos de limpieza. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-tipos-elemento'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre o del prefijo para filtrar la lista y encontrar un tipo rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-tipos-elemento'),
                popover: {
                    title: 'Tabla de tipos',
                    description: 'Cada fila es un tipo, con su nombre y su prefijo. Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('estado-tipo-elemento'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el tipo está activo o inactivo (dado de baja).',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-tipos-elemento-limpieza',
        titulo: '¿Cómo administro los tipos de elementos?',
        ruta: '/tipos-elementos-limpieza',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-tipo-elemento'),
                popover: {
                    title: 'Crear un tipo',
                    description: 'Con este botón abrís el formulario para crear un tipo de elemento nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: t('btn-editar-tipo-elemento'),
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del tipo. ' +
                        'Solo aparece en tipos activos: si está inactivo, primero hay que darlo de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-tipo-elemento'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva un tipo activo, o reactiva uno inactivo. No lo borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];