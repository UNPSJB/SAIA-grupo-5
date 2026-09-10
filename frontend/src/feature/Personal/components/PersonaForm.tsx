import { Button, Form } from 'react-bootstrap'
import { useState } from 'react'
import type { NewPersona } from '../types'

interface PersonaFormProps {
  textoBoton: string
  onSubmit: (datos: NewPersona) => void
  valoresIniciales?: NewPersona
}

export function PersonaForm({ textoBoton, onSubmit, valoresIniciales }: PersonaFormProps) {
  const [nombre, setNombre] = useState(valoresIniciales?.nombre || '')
  const [operar, setOperar] = useState(valoresIniciales?.operar || false)
  const [administrar, setAdministrar] = useState(valoresIniciales?.administrar || false)

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit({ nombre, operar, administrar })
  }

  return (
    <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3">
      <Form.Group className="mb-3" controlId="formNombre">
        <Form.Label>Nombre de la persona</Form.Label>
        <Form.Control
          required
          type="text"
          maxLength={40}
          placeholder="Ingrese el nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formCapacidades">
        <Form.Label>Capacidades</Form.Label>
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

      <Button variant="primary" type="submit">
        {textoBoton}
      </Button>
    </Form>
  )
}
