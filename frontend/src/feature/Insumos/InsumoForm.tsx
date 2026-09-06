import { Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { UnidadMedida } from './types';

interface InsumoFormProps{
  textoBoton: string;
  onSubmit: (datos: {nombre: string; unidad_medida: string}) => void;
}

export function InsumoForm({ textoBoton, onSubmit }: InsumoFormProps) {
  const [nombre, setNombre] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("");

  // El handleSubmit se usa para que no actualice la pagina al apretar el boton y envia a la pagina que lo utilice los datos
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {   // El FormEvent esta deprecated, consultar al profe cual se usa actualmente
    e.preventDefault();
    onSubmit({ nombre, unidad_medida: unidadMedida});
  }

  return (
    <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3">
      <Form.Group className="mb-3" controlId="formNombre">
        <Form.Label>Nombre del Insumo</Form.Label>
        <Form.Control type="text" placeholder="Ingrese el nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}/>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formUnidadMedida">
        <Form.Label>Unidad de medida</Form.Label>
        <Form.Select value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value)} >
          <option value="" disabled> Seleccione una unidad de medida</option>
          {Object.entries(UnidadMedida).map(([clave, valor]) => (     // Esto transforma el enum de types en una lista de clave valor para mostrarlo en las opciones
            <option key={clave} value={valor}>
              {clave} ({valor})
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Button variant="primary" type="submit">
        {textoBoton}
      </Button>
    </Form>
  );
}
