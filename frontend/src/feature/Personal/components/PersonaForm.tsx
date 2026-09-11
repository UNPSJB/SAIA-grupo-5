import { Button, Form } from 'react-bootstrap'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { NewPersona } from '../types'

interface PersonaFormProps {
  textoBoton: string
  onSubmit: (datos: NewPersona) => void
  valoresIniciales?: NewPersona
}

export function PersonaForm({ textoBoton, onSubmit, valoresIniciales }: PersonaFormProps) {
  const [validated, setValidated] = useState(false)
  const navigate = useNavigate()
  const [nombre, setNombre] = useState(valoresIniciales?.nombre || '')
  const [operar, setOperar] = useState(valoresIniciales?.operar || false)
  const [administrar, setAdministrar] = useState(valoresIniciales?.administrar || false)

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setValidated(true)
    if (!nombre.trim()) return
    onSubmit({ nombre: nombre.trim(), operar, administrar })
  }

  return (
    <div className="col-md-6 mx-auto">
      <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        <Form.Group className="mb-3 text-start" controlId="formNombre">
          <Form.Label className="p-1 fw-bold">Nombre de la persona</Form.Label>
          <Form.Control
            required
            type="text"
            maxLength={40}
            placeholder="Ingrese el nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            isInvalid={validated && !nombre.trim()}
          />
          <Form.Control.Feedback type="invalid">
            El nombre de la persona es obligatorio.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3 text-start" controlId="formCapacidades">
          <Form.Label className="p-1 fw-bold">Capacidades</Form.Label>
          <div className="text-start">
            <Form.Check
              type="checkbox"
              id="capacidad-operar"
              label="Operar"
              checked={operar}
              onChange={(e) => setOperar(e.target.checked)}
            />
            <Form.Check
              type="checkbox"
              id="capacidad-administrar"
              label="Administrar"
              checked={administrar}
              onChange={(e) => setAdministrar(e.target.checked)}
            />
          </div>
        </Form.Group>

        <Button variant="secondary" type="button" onClick={() => navigate('/personal')}>
          <i className="bi bi-x-circle me-1"></i>Cancelar
        </Button>
        <Button className="ms-2" variant="primary" type="submit">
          <i className="bi bi-floppy me-1"></i> {textoBoton}
        </Button>
      </Form>
    </div>
  )
}
