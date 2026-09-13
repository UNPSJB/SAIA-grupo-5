import { Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface EquipoFormProps{
  textoBoton: string;
  onSubmit: (datos: {nombre: string; categoria: string; ubicacion: string}) => void;
  valoresIniciales? : {nombre: string; categoria: string; ubicacion: string}
}

export function EquipoForm({ textoBoton, onSubmit, valoresIniciales}: EquipoFormProps) {
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  // Usamos useState y definimos que los valores pueden ser vacios por si se crea un nuevo equipo o que tengan un valor anterior para mostrarlos en caso de editar el insumo
  const [nombre, setNombre] = useState(valoresIniciales?.nombre || "");
  const [categoria, setCategoria] = useState(valoresIniciales?.categoria || "");
  const [ubicacion, setUbicacion] = useState(valoresIniciales?.ubicacion || "");

  // El handleSubmit se usa para que no actualice la pagina al apretar el boton y envia a la pagina que lo utilice los datos
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {  
    e.preventDefault();
    setValidated(true);
    if (!nombre.trim()) return;
    onSubmit({nombre: nombre.trim(), categoria, ubicacion});
  }

  return (
    <div className="col-md-6 mx-auto">
      <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        <Form.Group className="mb-3 text-start" controlId="formNombre">
          <Form.Label className="p-1 fw-bold">Nombre del Equipo</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Ingrese el nombre"
            value={nombre} onChange={(e) => setNombre(e.target.value)}
            isInvalid={validated && !nombre.trim()}
          />
          <Form.Control.Feedback type="invalid">
            El nombre del equipo es obligatorio.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3 text-start" controlId="formCategoria">
          <Form.Label className="p-1 fw-bold">Categoria del Equipo</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Ingrese la categoria"
            value={categoria} onChange={(e) => setCategoria(e.target.value)}/>
        </Form.Group>

        <Form.Group className="mb-3 text-start" controlId="formUbicacion">
          <Form.Label className="p-1 fw-bold">Ubicacion del Equipo</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Ingrese la ubicacion"
            value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}/>
        </Form.Group>

        <Button variant="secondary" className="ms-2" type="button"
          onClick={() => navigate('/equipos')}>
            <i className="bi bi-x-circle me-1"></i>Cancelar
        </Button>
        <Button variant="primary" type="submit">
          <i className="bi bi-floppy me-1"></i> {textoBoton}
        </Button>
        
      </Form>
    </div>
  );
}
