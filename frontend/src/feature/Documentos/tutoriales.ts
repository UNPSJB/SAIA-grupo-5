import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesDocumentos: Tutorial[] = [
    // ── Para cualquier usuario logueado ──────────────────────────────
    {
        id: 'que-puedo-hacer-documentos',
        titulo: '¿Qué puedo hacer en esta página?',
        ruta: '/documentos',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Listado de documentos',
                    description: 'Acá están todos los documentos del sistema. Te muestro rápidamente qué podés hacer.',
                },
            },
            {
                element: t('buscador-documentos'),
                popover: {
                    title: 'Buscador',
                    description: 'Escribí parte del nombre para filtrar la lista y encontrar un documento rápido.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-documentos'),
                popover: {
                    title: 'Tabla de documentos',
                    description: 'Cada fila es un documento. Podés ordenar por nombre o estado haciendo clic en el encabezado de la columna.',
                    side: 'top',
                },
            },
            {
                element: t('estado-documento'),
                popover: {
                    title: 'Estado',
                    description: 'Indica si el documento está activo o inactivo (dado de baja).',
                    side: 'left',
                },
            },
            {
                element: t('btn-ver-documento'),
                popover: {
                    title: 'Ver',
                    description: 'Abre el detalle del documento: su información, tipo y versiones.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Solo administradores ─────────────────────────────────────────
    {
        id: 'administrar-documentos',
        titulo: '¿Cómo administro documentos?',
        ruta: '/documentos',
        permiso: 'administrar',
        pasos: [
            {
                element: t('btn-nuevo-documento'),
                popover: {
                    title: 'Crear un documento',
                    description: 'Con este botón abrís el formulario para crear un documento nuevo.',
                    side: 'bottom',
                },
            },
            {
                element: `${t('btn-editar-documento')}:not(:disabled)`,
                popover: {
                    title: 'Editar',
                    description:
                        'Permite modificar el nombre, la descripción y el tipo del documento. ' +
                        'Si el documento está inactivo, el botón queda deshabilitado: primero hay que darlo de alta.',
                    side: 'left',
                },
            },
            {
                element: t('btn-baja-documento'),
                popover: {
                    title: 'Dar de baja / Dar de alta',
                    description: 'Desactiva un documento activo, o reactiva uno inactivo. No lo borra: se puede volver a dar de alta.',
                    side: 'left',
                },
            },
        ],
    },

    // ── Pantalla de edición (solo administradores) ───────────────────
    {
        id: 'editar-documento-formulario',
        titulo: '¿Cómo completo el formulario de edición?',
        ruta: '/documentos/:id/edit',
        permiso: 'administrar',
        pasos: [
            {
                element: t('form-documento'),
                popover: {
                    title: 'Datos del documento',
                    description: 'El formulario viene con los datos actuales. Modificá solo lo que necesites cambiar.',
                    side: 'top',
                },
            },
            {
                element: `${t('form-documento')} button[type="submit"]`,
                popover: {
                    title: 'Guardar cambios',
                    description:
                        'Cuando termines, hacé clic en "Editar Documento". Si todo sale bien, vas a volver al listado con un aviso de éxito.',
                    side: 'top',
                },
            },
        ],
    },
        // ── Pantalla de detalle del documento ────────────────────────────
    {
        id: 'acceder-versiones-documento',
        titulo: '¿Cómo accedo a las versiones del documento?',
        ruta: '/documentos/:id',
        pasos: [
            {
                element: t('info-documento'),
                popover: {
                    title: 'Detalle del documento',
                    description: 'Acá ves el nombre, la descripción, el tipo y el estado del documento.',
                    side: 'top',
                },
            },
            {
                element: `${t('btn-historial-versiones')}:not(:disabled)`,
                popover: {
                    title: 'Versiones del documento',
                    description:
                        'Hacé clic en este botón para abrir las versiones del documento. ' +
                        'Si no hay ningún botón resaltado, el documento está dado de baja y no tiene versiones disponibles. ' +
                        'En la pantalla siguiente hay otro tutorial en el botón (?).',
                    side: 'left',
                },
            },
        ],
    },
];

