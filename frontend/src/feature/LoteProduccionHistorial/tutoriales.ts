import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesLotesHistorial: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-lotes-historial',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/lotes-historial',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Historial de lotes de producción',
                    description: 'Acá podés revisar los lotes producidos y filtrarlos por período y producto. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('filtros-historial-lotes'),
                popover: {
                    title: 'Fechas y producto',
                    description:
                        'Elegí desde y hasta qué fecha querés ver los lotes, y opcionalmente un producto: ' +
                        'podés escribir para buscarlo en la lista. ' +
                        'La fecha "Desde" no puede ser posterior a "Hasta".',
                    side: 'bottom',
                },
            },
            {
                element: t('resumen-historial-lotes'),
                popover: {
                    title: 'Resumen del período',
                    description:
                        'Muestra el total de lotes del período. Si elegís un producto, también ves cuántos lotes son de ese producto, ' +
                        'cuántas unidades se produjeron y qué porcentaje representan del total. Solo cuenta lotes activos.',
                    side: 'bottom',
                },
            },
            {
                element: t('buscador-historial-lotes'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre del lote, del producto, su descripción o la cantidad para encontrar un lote rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-historial-lotes'),
                popover: {
                    title: 'Tabla de lotes',
                    description:
                        'Cada fila es un lote, con su producto, cantidad y fechas de producción y vencimiento. ' +
                        'Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-lotes-historial',
        titulo: '¿Cómo veo el detalle de un lote?',
        ruta: '/lotes-historial',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-ver-lote-hist'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle completo del lote. Desde ahí podés volver a esta pantalla.',
                    side: 'left',
                },
            },
        ],
    },
];