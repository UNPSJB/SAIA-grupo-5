import { Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SectorFormProps {
  textoBoton: string;
  onSubmit: (datos: { nombre: string }) => void;
  valoresIniciales?: { nombre: string }
}

export function SectorForm({ textoBoton, onSubmit, valoresIniciales }: SectorFormProps) {
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  // Usamos useState y definimos que el valor puede ser vacio por si se crea un nuevo sector o que tenga un valor anterior para mostrarlo en caso de editar el sector
  const [nombre, setNombre] = useState(valoresIniciales?.nombre || "");

  // El handleSubmit se usa para que no actualice la pagina al apretar el boton y envia a la pagina que lo utilice los datos
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidated(true);
    if (!nombre.trim()) return; // corta acá si falta algo
    onSubmit({ nombre: nombre.trim() });
  }

  return (
    <div className="col-md-6 mx-auto">
      <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        <Form.Group className="mb-3 text-start" controlId="formNombre">
          <Form.Label className="p-1 fw-bold">Nombre del Sector</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Ingrese el nombre"
            value={nombre} onChange={(e) => setNombre(e.target.value)}
            isInvalid={validated && !nombre.trim()}
          />
          <Form.Control.Feedback type="invalid">
            El nombre del sector es obligatorio.
          </Form.Control.Feedback>
        </Form.Group>
        <Button variant="secondary" type="button"
          onClick={() => navigate('/sectores')}>
          <i className="bi bi-x-circle me-1"></i>Cancelar
        </Button>
        <Button className="ms-2" variant="primary" type="submit">
          <i className="bi bi-floppy me-1"></i> {textoBoton}
        </Button>
      </Form>
    </div>
  );
}
