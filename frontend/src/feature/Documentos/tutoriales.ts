import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesDocumentos: Tutorial[] = [
    {
        id: 'editar-documento-lista',
        titulo: '¿Cómo edito un documento?',
        ruta: '/documentos',
        permiso: 'administrar',
        pasos: [
            {
                element: t('buscador-documentos'),
                popover: {
                    title: 'Buscá el documento',
                    description: 'Podés escribir el nombre para filtrar la lista y encontrar rápido el documento que querés editar.',
                    side: 'bottom',
                },
            },
            {
                element: t('tabla-documentos'),
                popover: {
                    title: 'Listado de documentos',
                    description: 'Cada fila es un documento. Los botones de la columna "Acciones" permiten operar sobre él.',
                    side: 'top',
                },  
            },
            {
                element: `${t('btn-editar-documento')}:not(:disabled)`,
                popover: {
                    title: 'Botón Editar',
                    description:
                        'Hacé clic en "Editar" para abrir el formulario del documento. ' +
                        'Si el documento está dado de baja el botón aparece deshabilitado: primero hay que darlo de alta.',
                    side: 'left',
                },
            },
        ],
    },
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
];