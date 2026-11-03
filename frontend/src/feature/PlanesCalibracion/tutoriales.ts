import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesPlanesCalibracion: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-planes-calibracion',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/planes-calibracion',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Planes de calibración',
                    description: 'Acá están los planes de calibración de los equipos. Te muestro rápidamente qué podés ver.',
                },
            },
            {
                element: t('buscador-planes-calibracion'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre del equipo, la fecha de inicio o la periodicidad para filtrar la lista.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-planes-calibracion'),
                popover: {
                    title: 'Tabla de planes',
                    description: 'Cada fila es un plan de calibración. Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('dias-calibracion'),
                popover: {
                    title: 'Días para calibración',
                    description:
                        'Indica cuánto falta para la próxima calibración. Si ya pasó la fecha, aparece como "Vencido"; ' +
                        'si todavía no tiene fecha definida, dice "Sin definir".',
                    side: 'left',
                },
            },
            {
                element: t('estado-plan-calibracion'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el plan está activo o inactivo (dado de baja).',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-planes-calibracion',
        titulo: '¿Cómo administro los planes de calibración?',
        ruta: '/planes-calibracion',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-plan-calibracion'),
                popover: {
                    title: 'Crear un plan',
                    description: 'Con este botón abrís el formulario para crear un plan de calibración nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: t('btn-historico-calibracion'),
                popover: {
                    title: 'Histórico',
                    description: 'Muestra las calibraciones ya realizadas de ese plan.',
                    side: 'left',
                },
            },
            {
                element: `${t('btn-editar-plan-calibracion')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del plan. ' +
                        'Si está inactivo, el botón queda deshabilitado: primero hay que darlo de alta.',
                    side: 'left',
                },
            },
            {
                element: `${t('btn-registrar-calibracion')} button:not(:disabled)`,
                popover: {
                    title: 'Registrar calibración',
                    description:
                        'Registra que se realizó la calibración del equipo, lo que actualiza la próxima fecha. ' +
                        'Solo está disponible en planes activos.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-plan-calibracion'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva un plan activo, o reactiva uno inactivo. No lo borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];