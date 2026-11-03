import type { DriveStep } from 'driver.js';
import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

const RUTA_VERSIONES = '/versiones-documentos/documento/:documentoId';

export const pasosListadoVersiones: DriveStep[] = [
    {
        // sin "element": se muestra centrado, como introducción
        popover: {
            title: 'Historial de versiones',
            description: 'Acá están todas las versiones del documento. Te explico qué podés hacer.',
        },
    },
    {
        element: t('buscador-versiones'),
        popover: {
            title: 'Buscador',
            description: 'Escribí el número de versión para filtrar la lista.',
            side: 'bottom',
        },
    },
    {
        element: t('switch-historicas'),
        popover: {
            title: 'Ver históricas',
            description: 'Por defecto la lista no incluye las versiones históricas. Activá este interruptor para verlas.',
            side: 'bottom',
        },
    },
    {
        element: t('tabla-versiones'),
        popover: {
            title: 'Tabla de versiones',
            description: 'Cada fila es una versión. Podés ordenar por cualquier columna haciendo clic en su encabezado.',
            side: 'top',
        },
    },
    {
        element: t('vigencia-version'),
        popover: {
            title: 'Vigencia',
            description:
                '"Vigente" es la versión que está en uso hoy. "Histórica" fue vigente y ya fue reemplazada. ' +
                '"Sin vigencia" todavía no se marcó como vigente.',
            side: 'left',
        },
    },
    {
        element: t('btn-ver-version'),
        popover: {
            title: 'Ver',
            description: 'Abre el detalle de la versión.',
            side: 'left',
        },
    },
];

export const tutorialesVersionesDocumentos: Tutorial[] = [
    {
        id: 'que-puedo-hacer-versiones',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: RUTA_VERSIONES,
        pasos: pasosListadoVersiones,
    },
    {
        id: 'administrar-versiones',
        titulo: '¿Cómo administro las versiones?',
        ruta: RUTA_VERSIONES,
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nueva-version'),
                popover: {
                    title: 'Nueva versión',
                    description: 'Abre el formulario para cargar una nueva versión de este documento.',
                    side: 'bottom',
                },
            },
            {
                element: t('btn-editar-version'),
                popover: {
                    title: 'Editar',
                    description: 'Permite modificar la versión. No está disponible para versiones históricas ni inactivas.',
                    side: 'left',
                },
            },
            {
                element: t('btn-marcar-vigente'),
                popover: {
                    title: 'Marcar vigente',
                    description:
                        'Hace que esta versión pase a ser la vigente. Solo aparece en versiones activas que todavía no son vigentes ni históricas. ' +
                        'Se pide confirmación antes de aplicar el cambio.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-version'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description:
                        'Desactiva una versión activa o reactiva una inactiva. ' +
                        'La versión vigente no se puede dar de baja mientras siga siendo la vigente.',
                    side: 'left',
                },
            },
        ],
    },
];