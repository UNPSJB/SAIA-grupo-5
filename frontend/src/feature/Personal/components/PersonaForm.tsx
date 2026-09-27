import React, { useState } from 'react'
import { Button, Form, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import type { NewPersona } from '../types'

interface PersonaFormProps {
  textoBoton: string
  onSubmit: (datos: NewPersona) => void
  valoresIniciales?: Partial<NewPersona>
  isEditing?: boolean
}

export function PersonaForm({ textoBoton, onSubmit, valoresIniciales, isEditing = false }: PersonaFormProps) {
  const [validated, setValidated] = useState(false)
  const navigate = useNavigate()

  const [nombre, setNombre] = useState(valoresIniciales?.nombre || '')
  const [apellido, setApellido] = useState(valoresIniciales?.apellido || '')
  const [dni, setDni] = useState(valoresIniciales?.dni || '')
  const [mail, setMail] = useState(valoresIniciales?.mail || '')
  const [username, setUsername] = useState(valoresIniciales?.username || '')
  const [password, setPassword] = useState('')
  const [operar, setOperar] = useState(valoresIniciales?.operar || false)
  const [administrar, setAdministrar] = useState(valoresIniciales?.administrar || false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setValidated(true)

    if (
      !nombre.trim() ||
      !apellido.trim() ||
      !dni.trim() ||
      !mail.trim() ||
      (!isEditing && !username.trim()) ||
      (!isEditing && !password.trim()) ||
      (isEditing && Boolean(password && password.length < 4)) ||
      (!operar && !administrar)
    ) {
      return
    }

    const payload: NewPersona = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni.trim(),
      mail: mail.trim(),
      username: username.trim(),
      operar,
      administrar,
    }

    if (password && password.trim()) {
      payload.password = password.trim()
    }

    onSubmit(payload)
  }

  return (
    <div className="col-md-8 mx-auto">
      <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3 text-start" controlId="formNombre">
              <Form.Label className="p-1 fw-bold">Nombre</Form.Label>
              <Form.Control
                required
                type="text"
                maxLength={50}
                placeholder="Ingrese el nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                isInvalid={validated && !nombre.trim()}
              />
              <Form.Control.Feedback type="invalid">El nombre es obligatorio.</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3 text-start" controlId="formApellido">
              <Form.Label className="p-1 fw-bold">Apellido</Form.Label>
              <Form.Control
                required
                type="text"
                maxLength={50}
                placeholder="Ingrese el apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                isInvalid={validated && !apellido.trim()}
              />
              <Form.Control.Feedback type="invalid">El apellido es obligatorio.</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3 text-start" controlId="formDni">
              <Form.Label className="p-1 fw-bold">DNI</Form.Label>
              <Form.Control
                required
                type="text"
                maxLength={20}
                placeholder="Ingrese el DNI"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                isInvalid={validated && !dni.trim()}
              />
              <Form.Control.Feedback type="invalid">El DNI es obligatorio.</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3 text-start" controlId="formMail">
              <Form.Label className="p-1 fw-bold">Correo Electrónico</Form.Label>
              <Form.Control
                required
                type="email"
                maxLength={100}
                placeholder="ejemplo@correo.com"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                isInvalid={validated && !mail.trim()}
              />
              <Form.Control.Feedback type="invalid">Ingrese un correo válido.</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3 text-start" controlId="formUsername">
              <Form.Label className="p-1 fw-bold">Nombre de usuario</Form.Label>
              <Form.Control
                required
                disabled={isEditing}
                type="text"
                maxLength={50}
                placeholder="usuario123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                isInvalid={validated && !isEditing && !username.trim()}
              />
              {isEditing ? (
                <Form.Text className="text-muted">
                  El nombre de usuario no puede ser modificado.
                </Form.Text>
              ) : (
                <Form.Control.Feedback type="invalid">El usuario es obligatorio.</Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3 text-start" controlId="formPassword">
              <Form.Label className="p-1 fw-bold">
                Contraseña {isEditing && <span className="text-muted fw-normal">(opcional)</span>}
              </Form.Label>
              <Form.Control
                required={!isEditing}
                type="password"
                placeholder={isEditing ? "Dejar en blanco para no cambiarla" : "Ingrese contraseña"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={validated && (!isEditing ? !password.trim() : Boolean(password && password.length < 4))}
              />
              <Form.Control.Feedback type="invalid">
                {isEditing ? "La contraseña debe tener al menos 4 caracteres." : "La contraseña es obligatoria."}
              </Form.Control.Feedback>
              {isEditing && (
                <Form.Text className="text-muted">
                  Complete solo si desea cambiar la contraseña de este usuario.
                </Form.Text>
              )}
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4 text-start" controlId="formCapacidades">
          <Form.Label className="p-1 fw-bold">Capacidades</Form.Label>
          <div className="d-flex gap-4">
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
          {validated && !operar && !administrar && (
            <div className="invalid-feedback d-block mt-1">
              Debe seleccionar al menos una capacidad.
            </div>
          )}
        </Form.Group>

        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate('/personal')}>
            <i className="bi bi-x-circle me-1"></i>Cancelar
          </Button>
          <Button variant="primary" type="submit">
            <i className="bi bi-floppy me-1"></i> {textoBoton}
          </Button>
        </div>
      </Form>
    </div>
  )
}
