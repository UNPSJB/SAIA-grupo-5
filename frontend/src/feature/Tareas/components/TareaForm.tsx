import { Button, Col, Form, Row } from 'react-bootstrap';
import { useState } from 'react';
import { Frecuencia, FRECUENCIA_LABELS, Prioridad, PRIORIDAD_LABELS } from '../types';
import type { TareaFormData } from '../types';

interface TareaFormProps {
  textoBoton: string;
  planNombre: string;
  onSubmit: (datos: TareaFormData) => void;
  onCancel: () => void;
  valoresIniciales?: TareaFormData;
}

export function TareaForm({ textoBoton, planNombre, onSubmit, onCancel, valoresIniciales }: TareaFormProps) {
  const [validated, setValidated] = useState(false);

  const [nombre, setNombre] = useState(valoresIniciales?.nombre || "");
  const [descripcion, setDescripcion] = useState(valoresIniciales?.descripcion || "");
  const [frecuencia, setFrecuencia] = useState<Frecuencia>(valoresIniciales?.frecuencia ?? Frecuencia.DIARIA);
  const [prioridad, setPrioridad] = useState<Prioridad>(valoresIniciales?.prioridad ?? Prioridad.MEDIA);
  const [fotoObligatoria, setFotoObligatoria] = useState(valoresIniciales?.foto_obligatoria ?? false);
  const [accionCorrectiva, setAccionCorrectiva] = useState(valoresIniciales?.accion_correctiva || "");

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidated(true);
    if (!nombre.trim()) return;
    onSubmit({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() ? descripcion.trim() : null,
      frecuencia,
      prioridad,
      foto_obligatoria: fotoObligatoria,
      accion_correctiva: accionCorrectiva.trim() ? accionCorrectiva.trim() : null,
    });
  };

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Form.Group className="mb-3 text-start" controlId="formTareaPlan">
        <Form.Label className="p-1 fw-bold">Plan de Limpieza</Form.Label>
        <Form.Control plaintext readOnly value={planNombre} />
      </Form.Group>

      <Form.Group className="mb-3 text-start" controlId="formTareaNombre">
        <Form.Label className="p-1 fw-bold">Nombre de la Tarea *</Form.Label>
        <Form.Control
          required
          type="text"
          placeholder="Ingrese el nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          isInvalid={validated && !nombre.trim()}
        />
        <Form.Control.Feedback type="invalid">
          El nombre de la tarea es obligatorio.
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3 text-start" controlId="formTareaDescripcion">
        <Form.Label className="p-1 fw-bold">Descripción</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Ingrese la descripción del procedimiento"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3 text-start" controlId="formTareaFrecuencia">
            <Form.Label className="p-1 fw-bold">Frecuencia *</Form.Label>
            <Form.Select
              value={frecuencia}
              onChange={(e) => setFrecuencia(Number(e.target.value) as Frecuencia)}
            >
              {Object.entries(Frecuencia).map(([key, value]) => (
                <option key={key} value={value}>
                  {FRECUENCIA_LABELS[value]}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3 text-start" controlId="formTareaPrioridad">
            <Form.Label className="p-1 fw-bold">Prioridad *</Form.Label>
            <Form.Select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as Prioridad)}
            >
              {Object.entries(Prioridad).map(([key, value]) => (
                <option key={key} value={value}>
                  {PRIORIDAD_LABELS[value]}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="d-flex align-items-center">
          <Form.Group className="mb-3 text-start" controlId="formTareaFotoObligatoria">
            <Form.Check
              type="checkbox"
              label="Foto obligatoria"
              checked={fotoObligatoria}
              onChange={(e) => setFotoObligatoria(e.target.checked)}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3 text-start" controlId="formTareaAccionCorrectiva">
            <Form.Label className="p-1 fw-bold">Acción correctiva</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingrese la acción correctiva (opcional)"
              value={accionCorrectiva}
              onChange={(e) => setAccionCorrectiva(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      <Button variant="secondary" type="button" onClick={onCancel}>
        <i className="bi bi-x-circle me-1"></i>Cancelar
      </Button>
      <Button className="ms-2" variant="primary" type="submit">
        <i className="bi bi-floppy me-1"></i> {textoBoton}
      </Button>
    </Form>
  );
}
