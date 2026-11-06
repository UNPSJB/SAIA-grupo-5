import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesTareas: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-tareas',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/tareas',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Tareas de los planes de limpieza',
                    description: 'Acá podés consultar las tareas de cada plan de limpieza. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('selector-plan-tareas'),
                popover: {
                    title: 'Plan de limpieza',
                    description:
                        'Elegí el plan del que querés ver las tareas. ' +
                        'Hasta que no selecciones uno, no se muestran tareas y los botones de la derecha quedan deshabilitados.',
                    side: 'bottom',
                },
            },
            {
                element: t('tarjetas-tareas'),
                popover: {
                    title: 'Tareas por frecuencia',
                    description:
                        'Una vez elegido el plan, las tareas se agrupan en pestañas: Diaria, Semanal, Quincenal y Mensual. ' +
                        'Por defecto se muestran las diarias. Si una pestaña no tiene tareas, vas a ver un aviso.',
                    side: 'top',
                },
            },
            {
                element: `.tab-pane.active ${t('tarjeta-tarea')}`,
                popover: {
                    title: 'Tarjeta de tarea',
                    description:
                        'Cada tarjeta es una tarea, con su nombre, descripción, a qué pertenece (sector, superficie o equipo) y su prioridad. ' +
                        'Hacé clic en una para abrir su detalle.',
                    side: 'top',
                },
            },
            {
                element: `${t('btn-filtrar-tarea')}:not(:disabled)`,
                popover: {
                    title: 'Filtrar por',
                    description:
                        'Permite filtrar las tareas del plan por sector, superficie o equipo. ' +
                        'Con el botón "Filtrar por" volvés a ver todas.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-tareas',
        titulo: '¿Cómo administro las tareas?',
        ruta: '/tareas',
        permiso: 'administrar',
        pasos: [
            {
                element: t('selector-plan-tareas'),
                popover: {
                    title: 'Primero elegí un plan',
                    description: 'Para agregar o modificar tareas, primero tenés que seleccionar el plan de limpieza al que pertenecen.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-agregar-tarea')}:not(:disabled)`,
                popover: {
                    title: 'Agregar tarea',
                    description: 'Abre el formulario para crear una tarea nueva dentro del plan de limpieza seleccionado.',
                    side: 'left',
                },
            },
            {
                element: `.tab-pane.active ${t('tarjeta-tarea')}`,
                popover: {
                    title: 'Editar, dar de baja o eliminar',
                    description:
                        'Hacé clic en una tarjeta para abrir su detalle. Desde ahí podés editarla, ' +
                        'dar de baja / dar de alta la tarea o eliminarla.',
                    side: 'top',
                },
            },
        ],
    },

    // ── Consumo de insumos (solo administradores) ────────────────────
    {
        id: 'acceder-consumo-insumos',
        titulo: '¿Cómo agrego el consumo de insumos?',
        ruta: '/tareas',
        permiso: 'administrar',
        pasos: [
            {
                element: `${t('btn-agregar-tarea')}:not(:disabled)`,
                popover: {
                    title: 'Agregar tarea',
                    description:
                        'Elegí un plan y hacé clic en este botón para crear la tarea. ' +
                        'Al terminar de guardarla, vas a poder agregar el consumo de insumos de esa tarea.',
                    side: 'left',
                },
            },
        ],
    },
];