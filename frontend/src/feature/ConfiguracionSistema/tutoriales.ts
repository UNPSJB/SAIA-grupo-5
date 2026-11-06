import type { Tutorial } from '../Tutoriales/types';
import { t } from '../Tutoriales/engine';

export const tutorialesConfiguracionSistema: Tutorial[] = [
    {
        id: 'que-puedo-hacer-configuracion-sistema',
        titulo: '¿Cómo configuro el sistema?',
        ruta: '/configuracion-sistema',
        permiso: 'administrar',
        pasos: [
            {
                // sin "element": se muestra centrado, como introducción
                popover: {
                    title: 'Configuración del sistema',
                    description: 'Acá ajustás los parámetros generales que usa todo el sistema. Te muestro cada uno.',
                },
            },
            {
                element: t('form-configuracion'),
                popover: {
                    title: 'Parámetros generales',
                    description: 'El formulario viene con los valores actuales. Modificá solo lo que necesites cambiar.',
                    side: 'top',
                },
            },
            {
                element: t('antelacion-personal'),
                popover: {
                    title: 'Antelación de vencimientos de personal',
                    description:
                        'Cantidad de días de anticipación con los que se avisa que un vencimiento de personal está por vencer. ' +
                        'Se usa en el panel de inicio y en el listado de vencimientos.',
                    side: 'right',
                },
            },
            {
                element: t('antelacion-elementos'),
                popover: {
                    title: 'Antelación de vencimientos de elementos',
                    description:
                        'Lo mismo, pero para los elementos de limpieza: con cuántos días de anticipación se marcan como "por vencer".',
                    side: 'right',
                },
            },
            {
                element: t('hora-generacion-checklists'),
                popover: {
                    title: 'Hora de generación de checklists',
                    description:
                        'Hora del día en la que el sistema genera automáticamente las tareas pendientes del checklist diario.',
                    side: 'right',
                },
            },
            {
                element: `${t('form-configuracion')} button[type="submit"]`,
                popover: {
                    title: 'Guardar cambios',
                    description:
                        'Cuando termines, hacé clic en "Guardar cambios". Si todo sale bien, vas a ver un aviso de éxito. ' +
                        'Si no guardás, los cambios no se aplican.',
                    side: 'top',
                },
            },
        ],
    },
];