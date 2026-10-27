import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesNotificaciones: Tutorial[] = [
    {
        id: 'que-puedo-hacer-notificaciones',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/notificaciones',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Centro de avisos',
                    description: 'Acá se guarda el historial de novedades operativas y condiciones pendientes. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('contador-pendientes'),
                popover: {
                    title: 'Pendientes',
                    description: 'Muestra cuántas notificaciones todavía no leíste ni se resolvieron.',
                    side: 'left',
                },
            },
            {
                element: t('buscador-notificaciones'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del título, el elemento, el tipo o el detalle para encontrar una notificación rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('filtro-notificaciones'),
                popover: {
                    title: 'Filtrar por estado',
                    description:
                        'Permite ver todas las notificaciones, solo las pendientes, las leídas o las resueltas. ' +
                        'Una notificación se marca como resuelta cuando la condición que la generó ya no existe.',
                    side: 'bottom',
                },
            },
            {
                element: t('btn-marcar-todas-leidas'),
                popover: {
                    title: 'Marcar todas como leídas',
                    description:
                        'Marca de una vez todas las notificaciones sin leer. ' +
                        'Este botón solo aparece cuando hay alguna sin leer.',
                    side: 'left',
                },
            },
            {
                element: t('tabla-notificaciones'),
                popover: {
                    title: 'Tabla de notificaciones',
                    description:
                        'Cada fila es una novedad, con el elemento o entidad al que se refiere y su fecha. ' +
                        'Las pendientes se destacan con un fondo verdoso. Podés ordenar por cualquier columna.',
                    side: 'top',
                },
            },
            {
                element: t('estado-notificacion'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si la notificación está pendiente, leída o resuelta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-marcar-leida'),
                popover: {
                    title: 'Marcar leída',
                    description: 'Marca esa notificación como leída. Solo aparece en las que están pendientes.',
                    side: 'left',
                },
            },
        ],
    },
];