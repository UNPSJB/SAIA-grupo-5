import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesIncidentes: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-incidentes',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/incidentes',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de incidentes',
                    description: 'Acá están los incidentes reportados y sus acciones correctivas. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('filtro-estado-incidentes'),
                popover: {
                    title: 'Filtrar por estado',
                    description: 'Permite ver todos los incidentes, solo los abiertos o solo los cerrados.',
                    side: 'bottom',
                },
            },
            {
                element: t('buscador-incidentes'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre, la descripción, el tipo o quién lo reportó para encontrar un incidente rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-incidentes'),
                popover: {
                    title: 'Tabla de incidentes',
                    description:
                        'Cada fila es un incidente. Podés ordenar por cualquier columna haciendo clic en su encabezado. ' +
                        'Los incidentes demorados se marcan con una advertencia en "Días abierto" y los dados de baja se ven atenuados.',
                    side: 'top',
                },
            },
            {
                element: t('estado-incidente'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el incidente está abierto o cerrado. Se cierra al registrar una acción correctiva.',
                    side: 'left',
                },
            },
            {
                element: t('btn-historial-incidente'),
                popover: {
                    title: 'Ver historial',
                    description: 'Abre el historial del incidente, con las acciones correctivas y reaperturas registradas.',
                    side: 'left',
                },
            },
            {
                element: `${t('btn-reabrir-incidente')} button:not(:disabled)`,
                popover: {
                    title: 'Reabrir incidente',
                    description:
                        'Vuelve a abrir un incidente que ya estaba cerrado. ' +
                        'Si el incidente está abierto o dado de baja, el botón queda deshabilitado.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-incidentes',
        titulo: '¿Cómo administro los incidentes?',
        ruta: '/incidentes',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-incidente'),
                popover: {
                    title: 'Crear un incidente',
                    description: 'Con este botón abrís el formulario para registrar un incidente nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-accion-correctiva')} button:not(:disabled)`,
                popover: {
                    title: 'Acción correctiva',
                    description:
                        'Permite registrar la acción correctiva de un incidente abierto, lo que lo cierra. ' +
                        'Queda deshabilitado si el incidente ya está cerrado o dado de baja.',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-incidente'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle completo del incidente.',
                    side: 'left',
                },
            },
            {
                element: `${t('btn-editar-incidente')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del incidente. ' +
                        'Si está dado de baja, el botón queda deshabilitado: primero hay que darlo de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-incidente'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva un incidente activo, o reactiva uno dado de baja. No lo borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];