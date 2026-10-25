import { Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import  type { UnidadMedida } from '../../UnidadMedida/types'
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks';

interface InsumoFormProps {
  textoBoton: string;
  onSubmit: (datos: { nombre: string; unidad_medida_id: number }) => void;
  valoresIniciales?: { nombre: string; unidad_medida_id: number }
}

export function InsumoForm({ textoBoton, onSubmit, valoresIniciales }: InsumoFormProps) {
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const { data: unidadesMedida, isLoading } = useApi<UnidadMedida[]> ('/unidades-medida/');

  // Usamos useState y definimos que los valores pueden ser vacios por si se crea un nuevo insumo o que tengan un valor anterior para mostrarlos en caso de editar el insumo
  const [nombre, setNombre] = useState(valoresIniciales?.nombre || "");
  const [unidadMedidaId, setUnidadMedidaId] = useState<number | "">(valoresIniciales?.unidad_medida_id || "");     // Se agrega el <UnidadMedida | ""> para exigir que los valores unicamente puedan ser los de las unidades de medidas que definio Alex

  // El handleSubmit se usa para que no actualice la pagina al apretar el boton y envia a la pagina que lo utilice los datos
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {   // Se actualizo a React.SubmitEvent
    e.preventDefault();
    setValidated(true);
    if (!nombre.trim() || !unidadMedidaId) return; // corta acá si falta algo
    onSubmit({ nombre: nombre.trim(), unidad_medida_id: Number(unidadMedidaId) });
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
            value={unidadMedidaId}
            onChange={(e) => setUnidadMedidaId(Number(e.target.value))}
            isInvalid={validated && !unidadMedidaId}
          >
            <option value="" disabled> Seleccione una unidad de medida</option>
            {isLoading && <option disabled> Cargando unidades de medida...</option>}
            {unidadesMedida?.filter(u => u.activo).map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            La unidad de medida es obligatoria.
          </Form.Control.Feedback>
        </Form.Group>
        <Button variant="secondary" type="button"
          onClick={() => navigate('/insumos')}>
          <i className="bi bi-x-circle me-1"></i>Cancelar
        </Button>
        <Button className="ms-2" variant="primary" type="submit">
          <i className="bi bi-floppy me-1"></i> {textoBoton}
        </Button>
      </Form>
    </div>
  );
}
