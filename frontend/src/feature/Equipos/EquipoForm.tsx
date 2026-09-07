import { Button, Form } from 'react-bootstrap';
import { useState } from 'react';

interface EquipoFormProps{
  textoBoton: string;
  onSubmit: (datos: {nombre: string; categoria: string; ubicacion: string}) => void;
  valoresIniciales? : {nombre: string; categoria: string; ubicacion: string}
}

export function EquipoForm({ textoBoton, onSubmit, valoresIniciales}: EquipoFormProps) {
  // Usamos useState y definimos que los valores pueden ser vacios por si se crea un nuevo equipo o que tengan un valor anterior para mostrarlos en caso de editar el insumo
  const [nombre, setNombre] = useState(valoresIniciales?.nombre || "");
  const [categoria, setCategoria] = useState(valoresIniciales?.categoria || "");
  const [ubicacion, setUbicacion] = useState(valoresIniciales?.ubicacion || "");

  // El handleSubmit se usa para que no actualice la pagina al apretar el boton y envia a la pagina que lo utilice los datos
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {   // El FormEvent esta deprecated, consultar al profe cual se usa actualmente
    e.preventDefault();
    onSubmit({nombre, categoria, ubicacion});
  }

  return (
    <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3">
      <Form.Group className="mb-3" controlId="formNombre">
        <Form.Label>Nombre del Equipo</Form.Label>
        <Form.Control type="text" placeholder="Ingrese el nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}/>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formCategoria">
        <Form.Label>Categoría del Equipo</Form.Label>
        <Form.Control type="text" placeholder="Ingrese la categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)}/>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formUbicacion">
        <Form.Label>Ubicación del Equipo</Form.Label>
        <Form.Control type="text" placeholder="Ingrese la ubicación" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}/>
      </Form.Group>

      <Button variant="primary" type="submit">
        {textoBoton}
      </Button>
    </Form>
  );
}
