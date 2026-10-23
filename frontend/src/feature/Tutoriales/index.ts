import type { Tutorial } from './types';
import { tutorialesDocumentos } from '../Documentos/tutoriales';

export const tutoriales: Tutorial[] = [
    ...tutorialesDocumentos,
    // acá se van sumando los de las otras features
];