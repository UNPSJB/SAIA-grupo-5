import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesChecklist: Tutorial[] = [
    {
        id: 'que-puedo-hacer-checklist',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/checklist',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Checklist de limpieza',
                    description:
                        'Acá ves las tareas de limpieza programadas para hoy. ' +
                        'La lista se actualiza sola cada 30 segundos.',
                },
            },
            {
                element: t('filtros-checklist'),
                popover: {
                    title: 'Filtros y búsqueda',
                    description:
                        'Filtrá por plan de limpieza con el menú desplegable, o buscá una tarea por nombre. ' +
                        'Para quitar el filtro de plan, elegí "Todos los planes".',
                    side: 'bottom',
                },
            },
            {
                element: t('listado-checklist'),
                popover: {
                    title: 'Tareas del día',
                    description:
                        'Cada tarea muestra su plan y su estado: "Pendiente" o "Realizada". ' +
                        'Las realizadas aparecen tachadas.',
                    side: 'top',
                },
            },
        ],
    },
    {
        id: 'marcar-tarea-realizada',
        titulo: '¿Cómo marco una tarea como realizada?',
        ruta: '/checklist',
        permiso: 'operar',
        pasos: [
            {
                element: t('listado-checklist'),
                popover: {
                    title: 'Encontrá tu tarea',
                    description: 'Ubicá en la lista la tarea que realizaste. Podés usar el buscador o el filtro por plan para encontrarla más rápido.',
                    side: 'top',
                },
            },
            {
                element: t('btn-marcar-realizada'),
                popover: {
                    title: 'Marcar como realizada',
                    description:
                        'Las tareas pendientes tienen este botón. Al hacer clic se abre una ventana para completarla. ' +
                        'Una vez realizada, el botón pasa a ser un lápiz para editarla, salvo que la haya completado otra persona.',
                    side: 'left',
                },
            },
        ],
    },
];