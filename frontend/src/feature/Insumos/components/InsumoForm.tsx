import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { useState } from 'react';
import  type { UnidadMedida } from '../../UnidadMedida/types'
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks';
import type { InformacionNutricional, MarcasAporte, NewInsumo } from '../types';
import { CAMPOS_NUTRICIONALES, MARCAS_APORTE, type CampoNutricional } from '../constants';
import { DATOS_NUTRICIONALES_CAA, nutrientesANumero, nutrientesATexto, type InfoNutricionalFormValues } from '../../InformacionNutricionalInsumo/types';
import {ESTADO_INFO_NUTRICIONAL_VACIO, InfoNutricionalInsumoForm, type InfoNutricionalFormState } from '../../InformacionNutricionalInsumo/components/InfoNutricionalInsumoForm';
import type { InsumoAlergenosUpdate } from '../../Alergenos/types';
import { InsumoAlergenosForm } from '../../Alergenos/components/InsumoAlergenosForm';

export interface InsumoConNutricionSubmit {
  insumo: NewInsumo;
  nutricion: InfoNutricionalFormValues | null;
  alergenos: InsumoAlergenosUpdate;
}

interface InsumoFormProps {
  textoBoton: string;
  onSubmit: (datos: InsumoConNutricionSubmit) => void;
  valoresIniciales?: NewInsumo;
  nutricionInicial?: InfoNutricionalFormValues | null;
  alergenosIniciales?: InsumoAlergenosUpdate | null;
}

const aTexto = (valor?: number | null) => (valor === null || valor === undefined ? "" : String(valor));
const aNumero = (valor: string) => (valor.trim() === "" ? null : Number(valor));

const armarEstadoNutricionInicial = (inicial?: InfoNutricionalFormValues | null): InfoNutricionalFormState => {
  if (!inicial) return ESTADO_INFO_NUTRICIONAL_VACIO;
  return {
    fuente_nutricional_id: inicial.fuente_nutricional_id,
    referencia_fuente: inicial.referencia_fuente || "",
    valores: nutrientesATexto(inicial),
    modificado_respecto_fuente: false,
    motivo: "",
  };
};

export function InsumoForm({ textoBoton, onSubmit, valoresIniciales, nutricionInicial, alergenosIniciales }: InsumoFormProps) {
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const { data: unidadesMedida, isLoading } = useApi<UnidadMedida[]> ('/unidades-medida/');

  // Usamos useState y definimos que los valores pueden ser vacios por si se crea un nuevo insumo o que tengan un valor anterior para mostrarlos en caso de editar el insumo
  const [nombre, setNombre] = useState(valoresIniciales?.nombre || "");
  const [marca, setMarca] = useState(valoresIniciales?.marca || "");
  const [unidadMedidaId, setUnidadMedidaId] = useState<number | "">(valoresIniciales?.unidad_medida_id || "");     // Se agrega el <UnidadMedida | ""> para exigir que los valores unicamente puedan ser los de las unidades de medidas que definio Alex
  const [pesoUnidad, setPesoUnidad] = useState(aTexto(valoresIniciales?.peso_unidad));
  const [nutricion, setNutricion] = useState<InfoNutricionalFormState>(armarEstadoNutricionInicial(nutricionInicial));

  const [marcas, setMarcas] = useState<MarcasAporte>({
    aporta_azucares: valoresIniciales?.aporta_azucares ?? false,
    aporta_grasas: valoresIniciales?.aporta_grasas ?? false,
    aporta_sodio: valoresIniciales?.aporta_sodio ?? false,
    aporta_edulcorantes: valoresIniciales?.aporta_edulcorantes ?? false,
    aporta_cafeina: valoresIniciales?.aporta_cafeina ?? false,
  });

  const [alergenosData, setAlergenosData] = useState<InsumoAlergenosUpdate>(alergenosIniciales ?? { contiene_gluten: false, alergenos: [] });

  const unidadSeleccionada = unidadesMedida?.find((u) => u.id === unidadMedidaId);

  const algunNutrienteCargado =
    nutricion.fuente_nutricional_id !== "" ||
    nutricion.referencia_fuente.trim() !== "" ||
    DATOS_NUTRICIONALES_CAA.some(({dato}) => (nutricion.valores?.[dato] ?? "").trim() !== "");

  const nutricionObligatoria = Boolean(nutricionInicial) || algunNutrienteCargado;
  const errorNutriente = (campo: CampoNutricional) => {
    const valor = nutricion[campo].trim();
    if (valor === "") return algunNutrienteCargado ? "Completá este valor o dejá vacía toda la información nutricional." : null;
    if (Number(valor) < 0) return "El valor no puede ser negativo.";
    const { maximo, unidad } = CAMPOS_NUTRICIONALES.find((c) => c.campo === campo)!;
    if (Number(valor) > maximo) return `No puede superar ${maximo.toLocaleString("es-AR")} ${unidad}.`;
    if (campo === "grasas_saturadas" && nutricion.grasas_totales.trim() !== "" && Number(valor) > Number(nutricion.grasas_totales)) {
      return "No puede superar a las grasas totales.";
    }
    return null;
  };

  const nutricionCompleta = !nutricionObligatoria || (
    nutricion.fuente_nutricional_id !== "" &&
    nutricion.referencia_fuente.trim() !== "" &&
    DATOS_NUTRICIONALES_CAA.every(
      ({ dato }) => (nutricion.valores?.[dato] ?? "").trim() !== "" && Number(nutricion.valores[dato]) >= 0
    )
  );

  const errorPesoUnidad = pesoUnidad.trim() !== "" && Number(pesoUnidad) <= 0 ? "El valor debe ser mayor a 0." : null;

  // El handleSubmit se usa para que no actualice la pagina al apretar el boton y envia a la pagina que lo utilice los datos
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {   // Se actualizo a React.SubmitEvent
    e.preventDefault();
    setValidated(true);
    if (!nombre.trim() || !marca.trim() || !unidadMedidaId || errorPesoUnidad || !nutricionCompleta) return; // corta acá si falta algo
    
    const payloadNutricion: InfoNutricionalFormValues | null = nutricionObligatoria
      ? {
          fuente_nutricional_id: Number(nutricion.fuente_nutricional_id),
          referencia_fuente: nutricion.referencia_fuente.trim(),
          ...nutrientesANumero(nutricion.valores),
          modificado_respecto_fuente: nutricion.modificado_respecto_fuente,
          motivo: nutricion.motivo.trim() || null,
        }
      : null;

    onSubmit({
      insumo: {
        nombre: nombre.trim(),
        marca: marca.trim(),
        unidad_medida_id: Number(unidadMedidaId),
        peso_unidad: aNumero(pesoUnidad),
        ...marcas,
      },
      nutricion: payloadNutricion,
      alergenos: alergenosData,
    });
  }

  return (
    <div className="col-md-6 mx-auto">
      <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        <Form.Group className="mb-3 text-start" controlId="formNombre">
          <Form.Label className="p-1 fw-bold">Nombre del Insumo (*)</Form.Label>
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
        <Form.Group className="mb-3 text-start" controlId="formMarca">
          <Form.Label className="p-1 fw-bold">Marca (*)</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Ingrese la marca"
            value={marca} onChange={(e) => setMarca(e.target.value)}
            isInvalid={validated && !marca.trim()}
          />
          <Form.Control.Feedback type="invalid">
            La marca del insumo es obligatorio.
          </Form.Control.Feedback>
        </Form.Group>

        <Row>
          <Form.Group className="mb-3 text-start" controlId="formUnidadMedida">
            <Form.Label className="p-1 fw-bold">Unidad de medida (*)</Form.Label>
            <Form.Select
              required
              value={unidadMedidaId}
              onChange={(e) => setUnidadMedidaId(Number(e.target.value))}
              isInvalid={validated && !unidadMedidaId}
            >
              <option value="" disabled> Seleccione una unidad de medida</option>
              {isLoading && <option disabled> Cargando unidades de medida...</option>}
              {unidadesMedida?.filter(u => u.activo).map((u) => (
                <option key={u.id} value={u.id}> {u.nombre} </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              La unidad de medida es obligatoria.
            </Form.Control.Feedback>
          </Form.Group>
          <Col>
              <Form.Group className="mb-3" controlId="form_peso_unidad">
                <Form.Label className="p-1 fw-bold">Peso de 1 {unidadSeleccionada?.nombre ?? "unidad"}</Form.Label>
                <InputGroup hasValidation>
                  <Form.Control
                    type="number"
                    min={0}
                    step="any"
                    placeholder="Opcional"
                    value={pesoUnidad}
                    onChange={(e) => setPesoUnidad(e.target.value)}
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
        
        <InsumoAlergenosForm valor={alergenosData} onChange={setAlergenosData} />

        <InfoNutricionalInsumoForm
          estado={nutricion}
          onChange={setNutricion}
          obligatoria={nutricionObligatoria}
          validated={validated}
          esEdicion={Boolean(nutricionInicial)}
        />

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
