import { Modal } from 'react-bootstrap';
import { api } from '../../../libs/axios';
import { getErrorMessage } from '../../../libs/errors';
import { TareaForm } from './TareaForm';
import type { Tarea, TareaFormData } from '../types';

interface TareaFormModalProps {
  show: boolean;
  onHide: () => void;
  planId: number;
  planNombre: string;
  tarea?: Tarea | null; // null/undefined = alta, con valor = edición
  onSaved: () => void;
}

export function TareaFormModal({ show, onHide, planId, planNombre, tarea, onSaved }: TareaFormModalProps) {
  const esEdicion = !!tarea;

  const guardarTarea = async (datos: TareaFormData) => {
    const payload = { ...datos, plan_limpieza_id: planId };
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
          } : undefined}
        />
      </Modal.Body>
    </Modal>
  );
}
