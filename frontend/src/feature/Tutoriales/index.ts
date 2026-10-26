import type { Tutorial } from './types';
import { tutorialesDocumentos } from '../Documentos/tutoriales';
import { tutorialesChecklist } from '../Checklist/tutoriales';
import { tutorialesVersionesDocumentos } from '../VersionesDocumentos/tutoriales';

export const tutoriales: Tutorial[] = [
    ...tutorialesDocumentos,
    ...tutorialesChecklist,
    ...tutorialesVersionesDocumentos,
];