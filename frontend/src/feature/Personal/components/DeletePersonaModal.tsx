import { Button, Modal } from 'react-bootstrap'
import { api } from '../../../libs/axios'
import type { Persona } from '../types'
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas'

interface DeletePersonaModalProps {
  persona: Persona | null
  onHide: () => void
  onDeleted: () => void
}

export function DeletePersonaModal({ persona, onHide, onDeleted }: DeletePersonaModalProps) {
  const handleCambiarEstado = async () => {
    if (!persona) return;
    const estabaActivo = persona.activo;

    try {
      await api.patch(`/personal/${persona.id}/estado`);
      mostrarAlertaExito(`El personal '${personaNombreCompleto}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
      onDeleted()
    } catch (error: any) {
      let mensajeFinal = `No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} al personal '${personaNombreCompleto}'.`;
            if (error.response?.data?.detail){      
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
    }finally{
      onHide();
    }
  }

  const personaNombreCompleto = persona ? `${persona.nombre} ${persona.apellido || ''}`.trim() : ''
  const estaActivo = persona?.activo ?? true;

  return (
    <Modal show={persona !== null} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} personal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Estás seguro que querés {estaActivo ? 'dar de baja' : 'dar de alta'} a <strong>{personaNombreCompleto}</strong>?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant={estaActivo ? "danger" : "success"} onClick={handleCambiarEstado}>
          {estaActivo ? 'Dar de baja' : 'Dar de alta'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}