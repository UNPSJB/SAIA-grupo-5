import { Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { UnidadMedida } from '../types';
import { useNavigate } from 'react-router-dom';

interface InsumoFormProps {
  textoBoton: string;
  onSubmit: (datos: { nombre: string; unidad_medida: UnidadMedida }) => void;
  valoresIniciales?: { nombre: string; unidad_medida: UnidadMedida }
}

export function InsumoForm({ textoBoton, onSubmit, valoresIniciales }: InsumoFormProps) {
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  // Usamos useState y definimos que los valores pueden ser vacios por si se crea un nuevo insumo o que tengan un valor anterior para mostrarlos en caso de editar el insumo
  const [nombre, setNombre] = useState(valoresIniciales?.nombre || "");
  const [unidadMedida, setUnidadMedida] = useState<UnidadMedida | "">(valoresIniciales?.unidad_medida || "");     // Se agrega el <UnidadMedida | ""> para exigir que los valores unicamente puedan ser los de las unidades de medidas que definio Alex

  // El handleSubmit se usa para que no actualice la pagina al apretar el boton y envia a la pagina que lo utilice los datos
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {   // Se actualizo a React.SubmitEvent
    e.preventDefault();
    setValidated(true);
    if (!nombre.trim() || !unidadMedida) return; // corta acá si falta algo
    onSubmit({ nombre: nombre.trim(), unidad_medida: unidadMedida as UnidadMedida });
  }

  return (
    <div className="col-md-6 mx-auto">
      <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        <Form.Group className="mb-3 text-start" controlId="formNombre">
          <Form.Label className="p-1 fw-bold">Nombre del Insumo</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Ingrese el nombre"
            value={nombre} onChange={(e) => setNombre(e.target.value)}
            isInvalid={validated && !nombre.trim()}
          />
          <Form.Control.Feedback type="invalid">
            El nombre del insumo es obligatorio.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3 text-start" controlId="formUnidadMedida">
          <Form.Label className="p-1 fw-bold">Unidad de medida</Form.Label>
          <Form.Select
            required
            value={unidadMedida}
            onChange={(e) => setUnidadMedida(e.target.value as UnidadMedida)}
            isInvalid={validated && !unidadMedida}
          >
            <option value="" disabled> Seleccione una unidad de medida</option>
            {Object.entries(UnidadMedida).map(([clave, valor]) => (     // Esto transforma el enum de types en una lista de clave valor para mostrarlo en las opciones
              <option key={clave} value={valor}>
                {valor}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            La unidad de medida es obligatoria.
          </Form.Control.Feedback>
        </Form.Group>
        <Button variant="primary" type="submit">
          <i className="bi bi-floppy me-1"></i> {textoBoton}
        </Button>
        <Button variant="secondary" className="ms-2" type="button"
          onClick={() => navigate('/insumos')}>
            <i className="bi bi-x-circle me-1"></i>Cancelar
          </Button>
      </Form>
    </div>
  );
}
