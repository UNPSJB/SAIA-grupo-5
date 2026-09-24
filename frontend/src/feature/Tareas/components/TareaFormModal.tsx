import { Modal } from 'react-bootstrap';
import { api } from '../../../libs/axios';
import { getErrorMessage } from '../../../libs/errors';
import { TareaForm } from './TareaForm';
import type { RelacionTipo, Tarea, TareaFormData } from '../types';

interface TareaFormModalProps {
  show: boolean;
  onHide: () => void;
  planId: number;
  planNombre: string;
  tarea?: Tarea | null; // null/undefined = alta, con valor = edición
  onSaved: () => void;
}

function relacionActual(tarea?: Tarea | null): { relacion_tipo: RelacionTipo; relacion_id: number | null } {
  if (tarea?.sector) return { relacion_tipo: "sector", relacion_id: tarea.sector.id };
  if (tarea?.superficie) return { relacion_tipo: "superficie", relacion_id: tarea.superficie.id };
  if (tarea?.equipo) return { relacion_tipo: "equipo", relacion_id: tarea.equipo.id };
  return { relacion_tipo: "sector", relacion_id: null };
}

export function TareaFormModal({ show, onHide, planId, planNombre, tarea, onSaved }: TareaFormModalProps) {
  const esEdicion = !!tarea;

  const guardarTarea = async (datos: TareaFormData) => {
    const { relacion_tipo, relacion_id, ...resto } = datos;
    const payload = {
      ...resto,
      plan_limpieza_id: planId,
      sector_id: relacion_tipo === "sector" ? relacion_id : null,
      superficie_id: relacion_tipo === "superficie" ? relacion_id : null,
      equipo_id: relacion_tipo === "equipo" ? relacion_id : null,
    };
    try {
      if (esEdicion) {
        await api.put(`/tareas/${tarea!.id}`, payload);
      } else {
        await api.post('/tareas', payload);
      }
      onSaved();
      onHide();
    } catch (error) {
      alert(getErrorMessage(error, esEdicion ? "No se pudo editar la tarea." : "No se pudo crear la tarea."));
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{esEdicion ? "Editar tarea" : "Agregar tarea"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TareaForm
          textoBoton={esEdicion ? "Editar tarea" : "Agregar tarea"}
          planNombre={planNombre}
          onSubmit={guardarTarea}
          onCancel={onHide}
          valoresIniciales={tarea ? {
            nombre: tarea.nombre,
            descripcion: tarea.descripcion,
            frecuencia: tarea.frecuencia,
            prioridad: tarea.prioridad,
            foto_obligatoria: tarea.foto_obligatoria,
            accion_correctiva: tarea.accion_correctiva,
            procedimiento: tarea.procedimiento,
            ...relacionActual(tarea),
          } : undefined}
        />
      </Modal.Body>
    </Modal>
  );
}
