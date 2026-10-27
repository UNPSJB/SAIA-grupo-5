import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesPersonal: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-personal',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/personal',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de personal',
                    description: 'Acá están todas las personas registradas en el sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-personal'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre, apellido, usuario, DNI o capacidad para filtrar la lista y encontrar a una persona rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-personal'),
                popover: {
                    title: 'Tabla de personal',
                    description: 'Cada fila es una persona. Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('capacidades-personal'),
                popover: {
                    title: 'Capacidades',
                    description:
                        'Indican qué puede hacer la persona en el sistema: "Operar" para realizar las tareas del día a día y ' +
                        '"Administrar" para gestionar la información. Puede tener más de una.',
                    side: 'left',
                },
            },
            {
                element: t('estado-personal'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si la persona está activa o inactiva (dada de baja).',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-personal',
        titulo: '¿Cómo administro el personal?',
        ruta: '/personal',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-personal'),
                popover: {
                    title: 'Crear una persona',
                    description: 'Con este botón abrís el formulario para registrar una persona nueva.',
                    side: 'bottom',
                },
            },
            {
                element: t('btn-vencimientos-general'),
                popover: {
                    title: 'Ver vencimientos',
                    description: 'Abre el listado general de vencimientos de todo el personal.',
                    side: 'bottom',
                },
            },
            {
                element: t('btn-ver-personal'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle de la persona.',
                    side: 'left',
                },
            },
            {
                element: t('btn-vencimientos-personal'),
                popover: {
                    title: 'Ver vencimientos de la persona',
                    description: 'Abre solo los vencimientos de esa persona.',
                    side: 'left',
                },
            },
            {
                element: `${t('btn-editar-personal')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos de la persona. ' +
                        'Si está inactiva, el botón queda deshabilitado: primero hay que darla de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-personal'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva a una persona activa, o reactiva a una inactiva. No se borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];