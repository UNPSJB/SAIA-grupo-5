import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesInicio: Tutorial[] = [
    // ── Para cualquier usuario logueado (incluye operadores) ─────────
    {
        id: 'que-puedo-hacer-inicio',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Resumen operativo',
                    description: 'Este es el panel de control con los indicadores de limpieza. Te muestro rápidamente qué podés ver.',
                },
            },
            {
                element: t('periodo-panel'),
                popover: {
                    title: 'Período analizado',
                    description: 'Los indicadores de checklists corresponden a los últimos 30 días.',
                    side: 'left',
                },
            },
            {
                element: t('seccion-inventario'),
                popover: {
                    title: 'Inventario, recambios y vencimientos',
                    description: 'Resume el estado de los elementos activos y sus fechas de recambio.',
                    side: 'bottom',
                },
            },
            {
                element: t('card-elementos-vencidos'),
                popover: {
                    title: 'Elementos vencidos',
                    description:
                        'Cantidad de elementos que ya pasaron su fecha de recambio. ' +
                        'Hacé clic en la tarjeta para ir al detalle de vencimientos.',
                    side: 'bottom',
                },
            },
            {
                element: t('card-elementos-por-vencer'),
                popover: {
                    title: 'Elementos por vencer',
                    description: 'Elementos que van a necesitar recambio dentro de la antelación configurada en el sistema.',
                    side: 'bottom',
                },
            },
            {
                element: t('grafico-recambios'),
                popover: {
                    title: 'Estado de recambios',
                    description:
                        'El gráfico muestra qué proporción de los elementos activos está al día, por vencer, vencida o sin frecuencia definida. ' +
                        'En el centro ves el total de elementos activos.',
                    side: 'top',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'indicadores-administrador-inicio',
        titulo: '¿Qué indicadores adicionales tengo?',
        ruta: '/',
        permiso: 'administrar',
        pasos: [
            {
                element: t('seccion-checklists'),
                popover: {
                    title: 'Checklists',
                    description:
                        'Muestra el total de tareas, cuántas se completaron, cuántas quedaron incumplidas (con las pendientes) ' +
                        'y el porcentaje de cumplimiento sobre las tareas ya resueltas.',
                    side: 'bottom',
                },
            },
            {
                element: t('grafico-actividad'),
                popover: {
                    title: 'Actividad de tareas',
                    description: 'Resultado diario de los últimos 7 días: completadas, incumplidas y pendientes. Pasá el mouse por las barras para ver el detalle.',
                    side: 'top',
                },
            },
            {
                element: t('card-personal-vencidos'),
                popover: {
                    title: 'Personal vencidos',
                    description: 'Cantidad de personas con algún vencimiento ya vencido. Al hacer clic vas al detalle de vencimientos de personal.',
                    side: 'bottom',
                },
            },
            {
                element: t('card-personal-por-vencer'),
                popover: {
                    title: 'Personal por vencer',
                    description: 'Personas con vencimientos dentro de la antelación configurada.',
                    side: 'bottom',
                },
            },
            {
                element: t('card-vencimientos-consolidados'),
                popover: {
                    title: 'Vencimientos consolidados',
                    description:
                        'Suma de todos los vencimientos y próximos vencimientos de personal, elementos y equipos. ' +
                        'Hacé clic para ver el listado completo.',
                    side: 'top',
                },
            },
        ],
    },
];