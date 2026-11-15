import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesClientes: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-clientes',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/clientes',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de clientes',
                    description: 'Acá están todos los clientes del sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-clientes'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte de la razón social o del CUIT para filtrar la lista y encontrar un cliente rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-clientes'),
                popover: {
                    title: 'Tabla de clientes',
                    description:
                        'Cada fila es un cliente, con su CUIT, teléfono y cantidad de direcciones cargadas. ' +
                        'Los más recientes aparecen primero. Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('estado-cliente'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el cliente está activo o inactivo (dado de baja).',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-cliente'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle del cliente.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-clientes',
        titulo: '¿Cómo administro los clientes?',
        ruta: '/clientes',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-cliente'),
                popover: {
                    title: 'Crear un cliente',
                    description: 'Con este botón abrís el formulario para crear un cliente nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-cliente')} button:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del cliente. ' +
                        'Si está inactivo, el botón queda deshabilitado: primero hay que reactivarlo.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-cliente'),
                popover: {
                    title: 'Dar de baja / Reactivar',
                    description: 'Desactiva un cliente activo, o reactiva uno inactivo. No lo borra: se puede volver a reactivar.',
                    side: 'left',
                },
            },
        ],
    },
];