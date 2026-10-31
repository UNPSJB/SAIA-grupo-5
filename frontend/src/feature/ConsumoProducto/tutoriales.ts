import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

const RUTA = '/consumos-productos/tarea/:id';

export const tutorialesConsumoProducto: Tutorial[] = [
    {
        id: 'que-puedo-hacer-consumos',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: RUTA,
        pasos: [
            {
                popover: {
                    title: 'Insumos químicos de la tarea',
                    description:
                        'Acá ves qué insumos químicos se usaron en esta tarea de limpieza y en qué cantidad.',
                },
            },
            {
                element: t('buscador-consumos'),
                popover: {
                    title: 'Buscador',
                    description: 'Buscá por nombre del insumo o por cantidad para filtrar la lista.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-consumos'),
                popover: {
                    title: 'Consumos registrados',
                    description:
                        'Cada fila es un insumo con su cantidad aproximada, su unidad de medida y su estado. ' +
                        'Podés ordenar por cualquier columna haciendo clic en el encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('btn-volver-consumos'),
                popover: {
                    title: 'Volver',
                    description: 'Te lleva de regreso al listado de tareas.',
                    side: 'top',
                },
            },
        ],
    },
    {
        id: 'administrar-consumos',
        titulo: '¿Cómo registro y modifico consumos?',
        ruta: RUTA,
        permiso: 'administrar', 
        pasos: [
            {
                element: t('btn-nuevo-consumo'),
                popover: {
                    title: 'Agregar un insumo',
                    description: 'Abre el formulario para registrar un insumo químico utilizado en esta tarea.',
                    side: 'bottom',
                },
            },
            {
                element: t('btn-editar-consumo'),
                popover: {
                    title: 'Editar',
                    description:
                        'Permite corregir el insumo o la cantidad. ' +
                        'Si el consumo está dado de baja, el botón queda deshabilitado: primero hay que darlo de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-consumo'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva un consumo activo o reactiva uno inactivo. No lo borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];

export const tutorialesConsumoAcumulado: Tutorial[] = [
    {
        id: 'que-puedo-hacer-consumo-acumulado',
        titulo: '¿Cómo consulto el consumo acumulado?',
        ruta: '/consumos-productos/consulta',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Consumo acumulado por producto químico',
                    description: 'Acá consultás cuánto se consumió de cada insumo químico en un período. Te explico cómo hacerlo.',
                },
            },
            {
                element: t('filtro-fecha-desde-consumo'),
                popover: {
                    title: 'Fecha desde',
                    description: 'Elegí la fecha de inicio del período. Si la dejás vacía, la consulta no tiene fecha de inicio.',
                    side: 'bottom',
                },
            },
            {
                element: t('filtro-fecha-hasta-consumo'),
                popover: {
                    title: 'Fecha hasta',
                    description: 'Elegí la fecha de fin del período. Si la dejás vacía, la consulta no tiene fecha de fin.',
                    side: 'bottom',
                },
            },
            {
                element: t('btn-consultar-consumo'),
                popover: {
                    title: 'Consultar',
                    description:
                        'Hacé clic para buscar los consumos del período elegido. ' +
                        'Hace falta completar al menos una de las dos fechas; si no, no se muestra nada.',
                    side: 'left',
                },
            },
            {
                element: t('tabla-consumo-acumulado'),
                popover: {
                    title: 'Resultado de la consulta',
                    description:
                        'Cada fila es un insumo químico, con el total consumido y su unidad de medida. ' +
                        'Podés ordenar por cualquier columna haciendo clic en su encabezado. ' +
                        'Si no hubo consumos en el período, vas a ver un aviso en su lugar.',
                    side: 'top',
                },
            },
        ],
    },
];