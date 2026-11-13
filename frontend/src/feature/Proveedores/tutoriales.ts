import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesProveedores: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-proveedores',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/proveedores',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de proveedores',
                    description: 'Acá están todos los proveedores y el estado de sus habilitaciones. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-proveedores'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre o del CUIT para filtrar la lista y encontrar un proveedor rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('filtro-estado-proveedores'),
                popover: {
                    title: 'Filtrar por estado',
                    description: 'Permite ver todos los proveedores, solo los activos o solo los inactivos (dados de baja).',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-proveedores'),
                popover: {
                    title: 'Tabla de proveedores',
                    description:
                        'Cada fila es un proveedor, con su CUIT, número de habilitación y fecha de vencimiento. ' +
                        'Podés ordenar por cualquier columna haciendo clic en su encabezado.',
                    side: 'top',
                },
            },
            {
                element: t('estado-habilitacion-proveedor'),
                popover: {
                    title: 'Estado de la habilitación',
                    description:
                        'Indica si la habilitación está vigente, próxima a vencer (dentro de los 30 días) o vencida, ' +
                        'con la cantidad de días correspondiente. Si el proveedor no tiene habilitación cargada, lo indica.',
                    side: 'left',
                },
            },
            {
                element: t('estado-proveedor'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el proveedor está activo o inactivo (dado de baja).',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-proveedor'),
                popover: {
                    title: 'Ver detalle',
                    description: 'Abre el detalle del proveedor.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-proveedores',
        titulo: '¿Cómo administro los proveedores?',
        ruta: '/proveedores',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-proveedor'),
                popover: {
                    title: 'Crear un proveedor',
                    description: 'Con este botón abrís el formulario para crear un proveedor nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-proveedor')} button:not(:disabled)`,
                popover: {
                    title: 'Editar datos',
                    description:
                        'Permite modificar los datos del proveedor. ' +
                        'Si está inactivo, el botón queda deshabilitado: primero hay que darlo de alta.',
                    side: 'left',
                },
            },
            {
                element: `${t('btn-renovar-habilitacion')} button:not(:disabled)`,
                popover: {
                    title: 'Cargar / Renovar habilitación',
                    description:
                        'Permite cargar la habilitación del proveedor o renovarla cuando está por vencer o vencida. ' +
                        'Queda deshabilitado si el proveedor está inactivo.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-proveedor'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva un proveedor activo, o reactiva uno inactivo. No lo borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];