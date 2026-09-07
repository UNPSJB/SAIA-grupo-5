import { Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { UnidadMedida } from '../types';

interface InsumoFormProps {
  textoBoton: string;
  onSubmit: (datos: { nombre: string; unidad_medida: UnidadMedida }) => void;
  valoresIniciales?: { nombre: string; unidad_medida: UnidadMedida }
}

export function InsumoForm({ textoBoton, onSubmit, valoresIniciales }: InsumoFormProps) {
  // Usamos useState y definimos que los valores pueden ser vacios por si se crea un nuevo insumo o que tengan un valor anterior para mostrarlos en caso de editar el insumo
  const [nombre, setNombre] = useState(valoresIniciales?.nombre || "");
  const [unidadMedida, setUnidadMedida] = useState<UnidadMedida | "">(valoresIniciales?.unidad_medida || "");     // Se agrega el <UnidadMedida | ""> para exigir que los valores unicamente puedan ser los de las unidades de medidas que definio Alex

  // El handleSubmit se usa para que no actualice la pagina al apretar el boton y envia a la pagina que lo utilice los datos
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {   // El FormEvent esta deprecated, consultar al profe cual se usa actualmente
    e.preventDefault();
    onSubmit({ nombre, unidad_medida: unidadMedida as UnidadMedida });
  }

  return (
    <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3">
      <Form.Group className="mb-3" controlId="formNombre">
        <Form.Label>Nombre del Insumo</Form.Label>
        <Form.Control
          required
          type="text"
          placeholder="Ingrese el nombre"
          value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formUnidadMedida">
        <Form.Label>Unidad de medida</Form.Label>
        <Form.Select required value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value as UnidadMedida)} >
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
