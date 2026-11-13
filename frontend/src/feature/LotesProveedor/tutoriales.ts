import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesRecepciones: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-recepciones',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/recepciones',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Recepciones',
                    description: 'Acá se registra la recepción de lotes de proveedores, su desempaque y su almacenamiento en planta. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-recepciones'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del número de lote, el remito o el proveedor para encontrar una recepción rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('filtro-estado-recepciones'),
                popover: {
                    title: 'Filtrar por estado',
                    description: 'Permite ver todas las recepciones, solo las activas o solo las inactivas (dadas de baja).',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-recepciones'),
                popover: {
                    title: 'Tabla de recepciones',
                    description: 'Cada fila es una recepción, con su lote, proveedor, remito y fecha. Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('etapa-recepcion'),
                popover: {
                    title: 'Etapa',
                    description:
                        'Indica en qué punto está la recepción: Llegada, Desempaque o Acomodado. ' +
                        'Avanza en ese orden hasta quedar almacenada.',
                    side: 'left',
                },
            },
            {
                element: t('estado-recepcion'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si la recepción está activa o inactiva (dada de baja).',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-recepcion'),
                popover: {
                    title: 'Ver detalle y trazabilidad',
                    description: 'Abre el detalle de la recepción y su trazabilidad.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo operadores ──────────────────────────────────────────────
    {
        id: 'operar-recepciones',
        titulo: '¿Cómo registro y avanzo una recepción?',
        ruta: '/recepciones',
        permiso: 'operar',
        pasos: [
            {
                element: t('btn-nueva-recepcion'),
                popover: {
                    title: 'Crear una recepción',
                    description: 'Con este botón abrís el formulario para registrar una recepción nueva.',
                    side: 'bottom',
                },
            },
            {
                element: t('btn-avanzar-recepcion'),
                popover: {
                    title: 'Avanzar de etapa',
                    description:
                        'Pasa la recepción a la siguiente etapa: de Llegada a Desempaque, y de Desempaque a Acomodado. ' +
                        'Solo aparece en recepciones activas que todavía no están acomodadas.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-recepciones',
        titulo: '¿Cómo administro las recepciones?',
        ruta: '/recepciones',
        permiso: 'administrar',
        pasos: [
            {
                element: `${t('btn-editar-recepcion')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos de la recepción. ' +
                        'Si está inactiva, el botón queda deshabilitado: primero hay que darla de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-recepcion'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva una recepción activa, o reactiva una inactiva. No la borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];