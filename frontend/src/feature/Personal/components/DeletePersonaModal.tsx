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
    await api.delete(`/personal/${persona.id}`)
    onDeleted()
    onHide()
  }

  return (
    <Modal show={persona !== null} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Eliminar persona</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Estás seguro que querés eliminar a <strong>{persona?.nombre}</strong>?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
      </Modal.Footer>
    </Modal>
  )
}