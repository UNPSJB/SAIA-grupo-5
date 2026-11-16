import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesInsumosLote: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-insumos-lote',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/insumos-lote',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Insumos alimenticios',
                    description: 'Acá controlás el stock de insumos recibidos, sus vencimientos y de qué recepción vienen. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-insumos-lote'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre del insumo, la marca, el número de lote o el proveedor para encontrarlo rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('filtro-insumos-lote'),
                popover: {
                    title: 'Filtrar',
                    description:
                        'Permite ver solo los activos, los inactivos o agotados, los de bajo stock, ' +
                        'o filtrar por vencimiento: vencidos, próximos a vencer (15 días) y vigentes.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-insumos-lote'),
                popover: {
                    title: 'Tabla de insumos',
                    description: 'Cada fila es un insumo de un lote recibido. Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('btn-origen-lote'),
                popover: {
                    title: 'Origen / Lote',
                    description: 'Muestra el número de lote y el proveedor. Al hacer clic te lleva a la recepción de ese lote, para ver su trazabilidad.',
                    side: 'left',
                },
            },
            {
                element: t('stock-insumo-lote'),
                popover: {
                    title: 'Stock',
                    description:
                        'Cantidad que queda sobre la cantidad recibida. Se ve en verde si el stock es normal, ' +
                        'en rojo si está en o por debajo del mínimo de alerta, y en gris si se agotó.',
                    side: 'left',
                },
            },
            {
                element: t('estado-fisico-insumo-lote'),
                popover: {
                    title: 'Estado físico',
                    description:
                        'Indica si el insumo está Disponible, Agotado (sin stock) o con Baja manual (dado de baja por un usuario).',
                    side: 'left',
                },
            },
            {
                element: t('estado-vencimiento-insumo-lote'),
                popover: {
                    title: 'Estado de vencimiento',
                    description:
                        'Indica si el insumo está vigente, próximo a vencer (15 días o menos) o vencido, con los días que faltan o que pasaron.',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-insumo-lote'),
                popover: {
                    title: 'Ver detalle',
                    description: 'Abre el detalle del insumo.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo operadores ──────────────────────────────────────────────
    {
        id: 'operar-insumos-lote',
        titulo: '¿Cómo doy de baja o de alta un insumo?',
        ruta: '/insumos-lote',
        permiso: 'operar',
        pasos: [
            {
                element: `${t('btn-baja-insumo-lote')} button:not(:disabled)`,
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description:
                        'Da de baja un insumo activo, o lo reactiva si estaba dado de baja. ' +
                        'Un insumo dado de baja que no tiene stock no se puede reactivar, y el botón queda deshabilitado.',
                    side: 'left',
                },
            },
        ],
    },
];