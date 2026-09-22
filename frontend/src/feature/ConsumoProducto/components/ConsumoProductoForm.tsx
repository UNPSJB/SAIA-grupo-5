import { Button, Form, Col, Row } from 'react-bootstrap';
import { useState } from 'react';
import { UnidadMedida } from '../types';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';


interface ConsumoProductoFormProps {
  textoBoton: string;
  onSubmit: (datos: { tarea_id: number; insumo_quimico_id: number; cantidad_aproximada: number; unidad_medida: UnidadMedida }) => void;
  valoresIniciales?: { cantidad_aproximada: number; unidad_medida: UnidadMedida }
}

export function ConsumoProductoForm({ textoBoton, onSubmit, valoresIniciales }: ConsumoProductoFormProps) {
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  // Usamos useState y definimos que los valores pueden ser vacios por si se crea un nuevo consumo o que tengan un valor anterior para mostrarlos en caso de editar el consumo
  const [tarea_id, setTareaId] = useState(valoresIniciales?.tarea_id || "");
  const [insumo_quimico_id, setInsumoQuimicoId] = useState(valoresIniciales?.insumo_quimico_id || "");
  const [cantidad_aproximada, setCantidadAproximada] = useState(valoresIniciales?.cantidad_aproximada || "");
  const [unidadMedida, setUnidadMedida] = useState<UnidadMedida | "">(valoresIniciales?.unidad_medida || "");     // Se agrega el <UnidadMedida | ""> para exigir que los valores unicamente puedan ser los de las unidades de medidas que definio Alex
  const { data: insumos } = useApi('/insumos/');
  //const { data: insumos } = useApi('/unidades_medida/');

  // El handleSubmit se usa para que no actualice la pagina al apretar el boton y envia a la pagina que lo utilice los datos
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {   // Se actualizo a React.SubmitEvent
    e.preventDefault();
    setValidated(true);
    if (!tarea_id || !insumo_quimico_id || !cantidad_aproximada.trim() || !unidadMedida) return; // corta acá si falta algo
    onSubmit({ tarea_id: Number(tarea_id), insumo_quimico_id: Number(insumo_quimico_id),
        cantidad_aproximada: Number(cantidad_aproximada), unidad_medida: unidadMedida as UnidadMedida });
  }

  return (
    <div className="col-md-6 mx-auto">
      <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        <Row>
            <Col md={4}>
                <Form.Group className="mb-3 text-start" controlId="formTareaId">
                    <Form.Label className="p-1 fw-bold">Tarea</Form.Label>
                    <Form.Control
                        required
                        type="number"
                        placeholder="Ingrese el id"
                        value={tarea_id} onChange={(e) => setTareaId(e.target.value)}
                        isInvalid={validated && !tarea_id.trim()}
                    />
                    <Form.Control.Feedback type="invalid">
                        El ID de la tarea es obligatorio.
                    </Form.Control.Feedback>
                </Form.Group>
            </Col>
            <Col md={8}>
                <Form.Group className="mb-3 text-start" controlId="formTareaNombre">
                    <Form.Label className="p-1 fw-bold">Nombre</Form.Label>
                    <div className="form-control bg-light">
                        Nombre de la tarea
                    </div>
                </Form.Group>
            </Col>
        </Row>
        <Row>
            <Col md={6}>
                <Form.Group className="mb-3 text-start">
                    <Form.Label className="p-1 fw-bold">Insumo Químico</Form.Label>
                    <Form.Select
                      required
                      value={insumo_quimico_id}
                      onChange={(e) => setInsumoQuimicoId(e.target.value)}
                      isInvalid={validated && !insumo_quimico_id}
                    >
                      <option value="">
                          Seleccione un insumo
                      </option>
                      {insumos?.map((insumo) => (
                        <option key={insumo.id} value={insumo.id}>
                            {insumo.nombre}
                        </option>
                      ))}
                    </Form.Select>

                    <Form.Control.Feedback type="invalid">
                        Debe seleccionar un insumo.
                    </Form.Control.Feedback>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group className="mb-3 text-start" controlId="formUnidadInsumo">
                    <Form.Label className="p-1 fw-bold">Unidad de medida</Form.Label>
                    <div className="form-control bg-light">
                      {insumos?.find(
                        (insumo) => String(insumo.id) === String(insumo_quimico_id)
                      )?.unidad_medida || "Seleccione un insumo"}
                    </div>
                </Form.Group>
            </Col>
        </Row>
        <Form.Group className="mb-3 text-start" controlId="formCantidadAproximada">
            <Form.Label className="p-1 fw-bold">Cantidad (aproximada)</Form.Label>
            <Form.Control
                required
                type="float"
                placeholder="Ingrese la cantidad"
                value={cantidad_aproximada} onChange={(e) => setCantidadAproximada(e.target.value)}
                isInvalid={validated && !cantidad_aproximada.trim()}
            />
            <Form.Control.Feedback type="invalid">
                La cantidad es obligatoria.
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

        <Button variant="secondary" type="button"
          onClick={() => navigate('/consumos_productos')}>
          <i className="bi bi-x-circle me-1"></i>Cancelar
        </Button>
        <Button className="ms-2" variant="primary" type="submit">
          <i className="bi bi-floppy me-1"></i> {textoBoton}
        </Button>
      </Form>
    </div>
  );
}
