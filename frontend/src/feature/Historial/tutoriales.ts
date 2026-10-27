import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesHistorial: Tutorial[] = [
    {
        id: 'que-puedo-hacer-historial',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/historial',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Historial de checklists',
                    description: 'Acá podés revisar las tareas de limpieza registradas en un período. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('filtro-fechas-historial'),
                popover: {
                    title: 'Rango de fechas',
                    description:
                        'Elegí desde qué fecha hasta qué fecha querés ver el historial. ' +
                        'Por defecto se muestran los últimos 7 días. La fecha "Desde" no puede ser posterior a "Hasta".',
                    side: 'bottom',
                },
            },
            {
                element: t('btn-solo-incumplidas'),
                popover: {
                    title: 'Ver solo incumplidas',
                    description:
                        'Filtra la tabla para mostrar únicamente las tareas incumplidas. ' +
                        'Volvé a hacer clic para ver todas de nuevo.',
                    side: 'left',
                },
            },
            {
                element: t('resumen-historial'),
                popover: {
                    title: 'Resumen del período',
                    description:
                        'Muestra el total de tareas, cuántas se completaron, cuántas quedaron incumplidas ' +
                        'y el porcentaje de cumplimiento sobre las tareas ya resueltas.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-historial'),
                popover: {
                    title: 'Tabla del historial',
                    description:
                        'Cada fila es una tarea del período, con su plan, prioridad, fecha de completado y estado. ' +
                        'Las filas completadas se ven en verde y las incumplidas en rojo. Podés ordenar por cualquier columna.',
                    side: 'top',
                },
            },
            {
                element: t('btn-ver-historial'),
                popover: {
                    title: 'Ver detalle',
                    description: 'Abre el detalle de esa tarea registrada.',
                    side: 'left',
                },
            },
        ],
    },
];