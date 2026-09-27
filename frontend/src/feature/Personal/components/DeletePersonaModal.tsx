import { Button, Modal } from 'react-bootstrap'
import { api } from '../../../libs/axios'
import type { Persona } from '../types'

interface DeletePersonaModalProps {
  persona: Persona | null
  onHide: () => void
  onDeleted: () => void
}

export function DeletePersonaModal({ persona, onHide, onDeleted }: DeletePersonaModalProps) {
  const handleDelete = async () => {
    if (!persona) return
    try {
      await api.delete(`/personal/${persona.id}`)
      onDeleted()
      onHide()
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'No se pudo dar de baja la persona.'
      alert(detail)
      console.log(err)
    }
  }

  const personaNombreCompleto = persona ? `${persona.nombre} ${persona.apellido || ''}`.trim() : ''

  return (
    <Modal show={persona !== null} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Eliminar persona</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Estás seguro que querés eliminar a <strong>{personaNombreCompleto}</strong>?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
      </Modal.Footer>
    </Modal>
  )
}