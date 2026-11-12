import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { useState } from 'react';
import  type { UnidadMedida } from '../../UnidadMedida/types'
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks';
import type { InformacionNutricional, MarcasAporte, NewInsumo } from '../types';
import { CAMPOS_NUTRICIONALES, MARCAS_APORTE, type CampoNutricional } from '../constants';

interface InsumoFormProps {
  textoBoton: string;
  onSubmit: (datos: NewInsumo) => void;
  valoresIniciales?: NewInsumo
}

type ValoresNutricionales = Record<keyof InformacionNutricional, string>;

const aTexto = (valor?: number | null) => (valor === null || valor === undefined ? "" : String(valor));
const aNumero = (valor: string) => (valor.trim() === "" ? null : Number(valor));

export function InsumoForm({ textoBoton, onSubmit, valoresIniciales }: InsumoFormProps) {
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const { data: unidadesMedida, isLoading } = useApi<UnidadMedida[]> ('/unidades-medida/');

  // Usamos useState y definimos que los valores pueden ser vacios por si se crea un nuevo insumo o que tengan un valor anterior para mostrarlos en caso de editar el insumo
  const [nombre, setNombre] = useState(valoresIniciales?.nombre || "");
  const [unidadMedidaId, setUnidadMedidaId] = useState<number | "">(valoresIniciales?.unidad_medida_id || "");     // Se agrega el <UnidadMedida | ""> para exigir que los valores unicamente puedan ser los de las unidades de medidas que definio Alex
  const [nutricion, setNutricion] = useState<ValoresNutricionales>({
    valor_energetico: aTexto(valoresIniciales?.valor_energetico),
    azucares_anadidos: aTexto(valoresIniciales?.azucares_anadidos),
    grasas_totales: aTexto(valoresIniciales?.grasas_totales),
    grasas_saturadas: aTexto(valoresIniciales?.grasas_saturadas),
    sodio: aTexto(valoresIniciales?.sodio),
    peso_unidad: aTexto(valoresIniciales?.peso_unidad),
  });

  const [marcas, setMarcas] = useState<MarcasAporte>({
    aporta_azucares: valoresIniciales?.aporta_azucares ?? false,
    aporta_grasas: valoresIniciales?.aporta_grasas ?? false,
    aporta_sodio: valoresIniciales?.aporta_sodio ?? false,
    aporta_edulcorantes: valoresIniciales?.aporta_edulcorantes ?? false,
    aporta_cafeina: valoresIniciales?.aporta_cafeina ?? false,
  });

  const unidadSeleccionada = unidadesMedida?.find((u) => u.id === unidadMedidaId);
  const algunNutrienteCargado = CAMPOS_NUTRICIONALES.some(({ campo }) => nutricion[campo].trim() !== "");

  const errorNutriente = (campo: CampoNutricional) => {
    const valor = nutricion[campo].trim();
    if (valor === "") return algunNutrienteCargado ? "Completá este valor o dejá vacía toda la información nutricional." : null;
    if (Number(valor) < 0) return "El valor no puede ser negativo.";
    if (campo !== "valor_energetico" && campo !== "sodio" && Number(valor) > 100) return "No puede superar los 100 g.";
    if (campo === "grasas_saturadas" && nutricion.grasas_totales.trim() !== "" && Number(valor) > Number(nutricion.grasas_totales)) {
      return "No puede superar a las grasas totales.";
    }
    return null;
  };

  const errorPesoUnidad = nutricion.peso_unidad.trim() !== "" && Number(nutricion.peso_unidad) <= 0
    ? "El valor debe ser mayor a 0."
    : null;

  const nutricionValida = CAMPOS_NUTRICIONALES.every(({ campo }) => errorNutriente(campo) === null) && errorPesoUnidad === null;

  // El handleSubmit se usa para que no actualice la pagina al apretar el boton y envia a la pagina que lo utilice los datos
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {   // Se actualizo a React.SubmitEvent
    e.preventDefault();
    setValidated(true);
    if (!nombre.trim() || !unidadMedidaId || !nutricionValida) return; // corta acá si falta algo
    onSubmit({
      nombre: nombre.trim(),
      unidad_medida_id: Number(unidadMedidaId),
      valor_energetico: aNumero(nutricion.valor_energetico),
      azucares_anadidos: aNumero(nutricion.azucares_anadidos),
      grasas_totales: aNumero(nutricion.grasas_totales),
      grasas_saturadas: aNumero(nutricion.grasas_saturadas),
      sodio: aNumero(nutricion.sodio),
      peso_unidad: aNumero(nutricion.peso_unidad),
      ...marcas,
    });
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

        <fieldset className="mb-3 text-start border-top pt-3">
          <legend className="fs-6 fw-bold p-1 mb-1">Información nutricional cada 100 g o ml (opcional)</legend>
          <p className="text-muted small px-1">
            Completala si el insumo es alimentario. Se usa para estimar si los productos que lo utilizan en su receta deben llevar sellos de advertencia.
          </p>
          <Row>
            {CAMPOS_NUTRICIONALES.map(({ campo, etiqueta, unidad }) => (
              <Col sm={6} key={campo}>
                <Form.Group className="mb-3" controlId={`form_${campo}`}>
                  <Form.Label className="p-1 fw-bold">{etiqueta}</Form.Label>
                  <InputGroup hasValidation>
                    <Form.Control
                      type="number"
                      min={0}
                      step="any"
                      placeholder="0"
                      value={nutricion[campo]}
                      onChange={(e) => setNutricion({ ...nutricion, [campo]: e.target.value })}
                      isInvalid={validated && errorNutriente(campo) !== null}
                    />
                    <InputGroup.Text>{unidad}</InputGroup.Text>
                    <Form.Control.Feedback type="invalid">{errorNutriente(campo)}</Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
            ))}
            <Col sm={6}>
              <Form.Group className="mb-3" controlId="form_peso_unidad">
                <Form.Label className="p-1 fw-bold">Peso de 1 {unidadSeleccionada?.nombre ?? "unidad"}</Form.Label>
                <InputGroup hasValidation>
                  <Form.Control
                    type="number"
                    min={0}
                    step="any"
                    placeholder="Opcional"
                    value={nutricion.peso_unidad}
                    onChange={(e) => setNutricion({ ...nutricion, peso_unidad: e.target.value })}
                    isInvalid={validated && errorPesoUnidad !== null}
                  />
                  <InputGroup.Text>g / ml</InputGroup.Text>
                  <Form.Control.Feedback type="invalid">{errorPesoUnidad}</Form.Control.Feedback>
                </InputGroup>
                <Form.Text className="text-muted">
                  Solo es necesario si la unidad de medida no es de peso o volumen (por ejemplo, Unidad o Docena).
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </fieldset>

        <fieldset className="mb-3 text-start border-top pt-3">
          <legend className="fs-6 fw-bold p-1 mb-1">Marcas para el rotulado frontal</legend>
          <p className="text-muted small px-1">
            Indicá si el insumo aporta azúcares, grasas o sodio agregados, o si es un aditivo edulcorante o con cafeína. Se usa para proponer las marcas del producto.
          </p>
          <Row>
            {MARCAS_APORTE.map(({ campo, etiqueta }) => (
              <Col sm={6} key={campo}>
                <Form.Check
                  type="checkbox"
                  id={`form_${campo}`}
                  className="mb-2"
                  label={etiqueta}
                  checked={marcas[campo]}
                  onChange={(e) => setMarcas({ ...marcas, [campo]: e.target.checked })}
                />
              </Col>
            ))}
          </Row>
        </fieldset>

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
