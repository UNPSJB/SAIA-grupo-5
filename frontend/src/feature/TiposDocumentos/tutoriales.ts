import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesTiposDocumentos: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-tipos-documentos',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/tipos-documentos',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de tipos de documentos',
                    description: 'Acá están todos los tipos de documentos del sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-tipos-documentos'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre para filtrar la lista y encontrar un tipo de documento rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-tipos-documentos'),
                popover: {
                    title: 'Tabla de tipos de documentos',
                    description: 'Cada fila es un tipo de documento. Podés ordenar por nombre o estado haciendo clic en el encabezado de la columna.',
                    side: 'top',
                },
            },
            {
                element: t('estado-tipo-documento'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el tipo de documento está activo o inactivo (dado de baja).',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-tipo-documento'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle del tipo de documento.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-tipos-documentos',
        titulo: '¿Cómo administro los tipos de documentos?',
        ruta: '/tipos-documentos',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-tipo-documento'),
                popover: {
                    title: 'Crear un tipo de documento',
                    description: 'Con este botón abrís el formulario para crear un tipo de documento nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-tipo-documento')}:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar los datos del tipo de documento. ' +
                        'Si está inactivo, el botón queda deshabilitado: primero hay que darlo de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-tipo-documento'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva un tipo de documento activo, o reactiva uno inactivo. No lo borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },
];