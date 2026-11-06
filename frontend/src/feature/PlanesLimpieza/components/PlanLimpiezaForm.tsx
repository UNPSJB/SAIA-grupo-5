import { Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PlanLimpiezaFormProps {
  textoBoton: string;
  onSubmit: (datos: { nombre: string; descripcion: string | null }) => void;
  valoresIniciales?: { nombre: string; descripcion: string | null }
}

export function PlanLimpiezaForm({ textoBoton, onSubmit, valoresIniciales }: PlanLimpiezaFormProps) {
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  // Usamos useState y definimos que los valores pueden ser vacios por si se crea un nuevo plan o que tengan un valor anterior para mostrarlos en caso de editar
  const [nombre, setNombre] = useState(valoresIniciales?.nombre || "");
  const [descripcion, setDescripcion] = useState(valoresIniciales?.descripcion || "");

  // El handleSubmit se usa para que no actualice la pagina al apretar el boton y envia a la pagina que lo utilice los datos
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidated(true);
    if (!nombre.trim()) return;
    onSubmit({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() ? descripcion.trim() : null,
    });
  }

  return (
    <div className="col-md-6 mx-auto">
      <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        <Form.Group className="mb-3 text-start" controlId="formNombre">
          <Form.Label className="p-1 fw-bold">Nombre del Plan de Limpieza *</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Ingrese el nombre"
            value={nombre} onChange={(e) => setNombre(e.target.value)}
            isInvalid={validated && !nombre.trim()}
          />
          <Form.Control.Feedback type="invalid">
            El nombre del plan de limpieza es obligatorio.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3 text-start" controlId="formDescripcion">
          <Form.Label className="p-1 fw-bold">Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Ingrese una descripción (opcional)"
            value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
          />
        </Form.Group>

        <Button variant="secondary" type="button"
          onClick={() => navigate('/planes-limpieza')}>
          <i className="bi bi-x-circle me-1"></i>Cancelar
        </Button>
        <Button className="ms-2" variant="primary" type="submit">
          <i className="bi bi-floppy me-1"></i> {textoBoton}
        </Button>
      </Form>
    </div>
  );
}
