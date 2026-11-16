import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesLotesProduccion: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-lotes-produccion',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/lotes-produccion',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de lotes de producción',
                    description: 'Acá están todos los lotes de producción del sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-lotes'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre del producto para filtrar la lista y encontrar un lote rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('filtro-estado-lotes'),
                popover: {
                    title: 'Filtrar por estado',
                    description:
                        'Permite ver solo los lotes en un estado determinado: En producción, Empaquetando, Terminado, ' +
                        'Parcialmente despachado o Enviado.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-lotes'),
                popover: {
                    title: 'Tabla de lotes',
                    description:
                        'Cada fila es un lote, con su producto, fechas, stock y estado. ' +
                        'Por defecto aparecen primero los lotes menos avanzados, y dentro de cada estado los más recientes. ' +
                        'Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('stock-lote'),
                popover: {
                    title: 'Stock',
                    description:
                        'Muestra la cantidad disponible sobre la cantidad producida. ' +
                        'Se ve en rojo cuando el lote se quedó sin stock.',
                    side: 'left',
                },
            },
            {
                element: t('estado-lote'),
                popover: {
                    title: 'Estado',
                    description:
                        'Indica en qué etapa está el lote: En producción, Empaquetando, Terminado, ' +
                        'Parcialmente despachado o Enviado.',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-lote'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle del lote.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo operadores ──────────────────────────────────────────────
    {
        id: 'operar-lotes-produccion',
        titulo: '¿Cómo gestiono un lote?',
        ruta: '/lotes-produccion',
        permiso: 'operar',
        pasos: [
            {
                element: t('btn-nuevo-lote'),
                popover: {
                    title: 'Crear un lote',
                    description: 'Con este botón abrís el formulario para registrar un lote de producción nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-lote')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del lote. ' +
                        'Queda deshabilitado cuando el lote ya fue enviado o parcialmente despachado.',
                    side: 'left',
                },
            },
            {
                element: `${t('btn-insumos-lote')} button:not(:disabled)`,
                popover: {
                    title: 'Asociar o modificar insumos',
                    description:
                        'Permite indicar qué insumos se usaron en el lote. Si ya tiene insumos, te deja modificarlos. ' +
                        'Solo está habilitado mientras el lote está "En producción".',
                    side: 'left',
                },
            },
            {
                element: t('btn-avanzar-lote'),
                popover: {
                    title: 'Avanzar de estado',
                    description:
                        'Pasa el lote a la siguiente etapa: de "En producción" a "Empaquetando", y de "Empaquetando" a "Terminado". ' +
                        'Solo aparece en lotes que todavía no terminaron.',
                    side: 'left',
                },
            },
            {
                element: `${t('btn-despachar-lote')} button:not(:disabled)`,
                popover: {
                    title: 'Despachar envío',
                    description:
                        'Crea un envío con el stock del lote. Solo aparece en lotes "Terminado" o "Parcialmente despachado", ' +
                        'y queda deshabilitado si no queda stock disponible.',
                    side: 'left',
                },
            },
        ],
    },
];