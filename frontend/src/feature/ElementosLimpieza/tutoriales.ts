import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesElementosLimpieza: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-elementos-limpieza',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/elementos-limpieza',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de elementos de limpieza',
                    description: 'Acá están todos los elementos de limpieza del sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-elementos'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del código, nombre, tipo, material o ubicación para filtrar la lista y encontrar un elemento rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('filtro-estado-elementos'),
                popover: {
                    title: 'Filtrar por estado de recambio',
                    description:
                        'Permite ver solo los elementos vencidos o los que están por vencer (dentro de los próximos 7 días). ' +
                        'Con el botón "Filtrar por" volvés a ver todos.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-elementos'),
                popover: {
                    title: 'Tabla de elementos',
                    description: 'Cada fila es un elemento de limpieza. Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('dias-recambio-elemento'),
                popover: {
                    title: 'Días para recambio',
                    description:
                        'Indica cuánto falta para cambiar el elemento. Si ya pasó la fecha, aparece como "Vencido"; ' +
                        'si todavía no tiene fecha definida, dice "Sin definir".',
                    side: 'left',
                },
            },
            {
                element: t('estado-elemento'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el elemento está activo o inactivo (dado de baja).',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-elemento'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle del elemento de limpieza.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-elementos-limpieza',
        titulo: '¿Cómo administro los elementos de limpieza?',
        ruta: '/elementos-limpieza',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-elemento'),
                popover: {
                    title: 'Crear un elemento',
                    description: 'Con este botón abrís el formulario para crear un elemento de limpieza nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: t('btn-editar-elemento'),
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del elemento. ' +
                        'Solo aparece en elementos activos: si está inactivo, primero hay que darlo de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-recambio-elemento'),
                popover: {
                    title: 'Registrar recambio',
                    description:
                        'Abre el formulario para registrar el recambio del elemento. ' +
                        'Solo está disponible en elementos activos.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-elemento'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva un elemento activo, o reactiva uno inactivo. No lo borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];