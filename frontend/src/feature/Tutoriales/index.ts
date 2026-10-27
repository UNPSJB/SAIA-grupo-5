import type { Tutorial } from './types';
import { tutorialesDocumentos } from '../Documentos/tutoriales';
import { tutorialesChecklist } from '../Checklist/tutoriales';
import { tutorialesVersionesDocumentos } from '../VersionesDocumentos/tutoriales';
import { tutorialesConsumoProducto } from '../ConsumoProducto/tutoriales';
import { tutorialesTareas } from '../Tareas/tutoriales';
import { tutorialesElementosLimpieza } from '../ElementosLimpieza/tutoriales';

export const tutoriales: Tutorial[] = [
    ...tutorialesDocumentos,
    ...tutorialesChecklist,
    ...tutorialesVersionesDocumentos,
    ...tutorialesConsumoProducto,
    ...tutorialesTareas,
    ...tutorialesElementosLimpieza
];