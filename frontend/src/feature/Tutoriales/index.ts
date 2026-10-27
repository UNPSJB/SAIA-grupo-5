import type { Tutorial } from './types';
import { tutorialesDocumentos } from '../Documentos/tutoriales';
import { tutorialesChecklist } from '../Checklist/tutoriales';
import { tutorialesVersionesDocumentos } from '../VersionesDocumentos/tutoriales';
import { tutorialesConsumoProducto } from '../ConsumoProducto/tutoriales';
import { tutorialesTareas } from '../Tareas/tutoriales';
import { tutorialesElementosLimpieza } from '../ElementosLimpieza/tutoriales';
import { tutorialesEquipos } from '../Equipos/tutoriales';
import { tutorialesHistorial } from '../Historial/tutoriales';
import { tutorialesInicio } from '../Home/tutoriales';
import { tutorialesIncidentes } from '../Incidentes/tutoriales';
import { tutorialesInsumos } from '../Insumos/tutoriales';
import { tutorialesConfiguracionSistema } from '../ConfiguracionSistema/tutoriales';
import { tutorialesInsumosQuimicos } from '../InsumosQuimicos/tutoriales';
import { tutorialesNotificaciones } from '../Notificaciones/tutoriales';
import { tutorialesPersonal } from '../Personal/tutoriales';

export const tutoriales: Tutorial[] = [
    ...tutorialesDocumentos,
    ...tutorialesChecklist,
    ...tutorialesVersionesDocumentos,
    ...tutorialesConsumoProducto,
    ...tutorialesTareas,
    ...tutorialesElementosLimpieza,
    ...tutorialesEquipos,
    ...tutorialesHistorial,
    ...tutorialesInicio,
    ...tutorialesIncidentes,
    ...tutorialesInsumos,
    ...tutorialesConfiguracionSistema,
    ...tutorialesInsumosQuimicos,
    ...tutorialesNotificaciones,
    ...tutorialesPersonal
];