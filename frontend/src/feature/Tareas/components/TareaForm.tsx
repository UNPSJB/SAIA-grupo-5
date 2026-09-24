import { Alert, Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import type { Sector } from '../../Sectores/types';
import type { Superficie } from '../../Superficies/types';
import type { Equipo } from '../../Equipos/types';
import { Frecuencia, FRECUENCIA_LABELS, Prioridad, PRIORIDAD_LABELS } from '../types';
import type { RelacionTipo, TareaFormData } from '../types';

const RELACION_LABELS: Record<RelacionTipo, string> = {
  sector: "Sector",
  superficie: "Superficie",
  equipo: "Equipo",
};

interface TareaFormProps {
  textoBoton: string;
  planNombre: string;
  onSubmit: (datos: TareaFormData) => void;
  onCancel: () => void;
  valoresIniciales?: TareaFormData;
}

export function TareaForm({ textoBoton, planNombre, onSubmit, onCancel, valoresIniciales }: TareaFormProps) {
  const [validated, setValidated] = useState(false);

  const [nombre, setNombre] = useState(valoresIniciales?.nombre || "");
  const [descripcion, setDescripcion] = useState(valoresIniciales?.descripcion || "");
  const [frecuencia, setFrecuencia] = useState<Frecuencia>(valoresIniciales?.frecuencia ?? Frecuencia.DIARIA);
  const [prioridad, setPrioridad] = useState<Prioridad>(valoresIniciales?.prioridad ?? Prioridad.MEDIA);
  const [fotoObligatoria, setFotoObligatoria] = useState(valoresIniciales?.foto_obligatoria ?? false);
  const [accionCorrectiva, setAccionCorrectiva] = useState(valoresIniciales?.accion_correctiva || "");
  const [procedimiento, setProcedimiento] = useState<string[]>(valoresIniciales?.procedimiento ?? []);
  const [pasoNuevo, setPasoNuevo] = useState("");
  const [relacionTipo, setRelacionTipo] = useState<RelacionTipo>(valoresIniciales?.relacion_tipo ?? "sector");
  const [relacionId, setRelacionId] = useState(valoresIniciales?.relacion_id ? String(valoresIniciales.relacion_id) : "");

  const { data: sectores, isLoading: isLoadingSectores } = useApi<Sector[]>(
    relacionTipo === "sector" ? "/sectores/" : null
  );
  const { data: superficies, isLoading: isLoadingSuperficies } = useApi<Superficie[]>(
    relacionTipo === "superficie" ? "/superficies/" : null
  );
  const { data: equipos, isLoading: isLoadingEquipos } = useApi<Equipo[]>(
    relacionTipo === "equipo" ? "/equipos" : null
  );
  const opciones = relacionTipo === "sector" ? sectores : relacionTipo === "superficie" ? superficies : equipos;
  const cargandoOpciones = relacionTipo === "sector" ? isLoadingSectores : relacionTipo === "superficie" ? isLoadingSuperficies : isLoadingEquipos;

  // Al cambiar el tipo de relación se pierde la entidad elegida del tipo anterior.
  useEffect(() => {
    setRelacionId(valoresIniciales?.relacion_tipo === relacionTipo && valoresIniciales?.relacion_id
      ? String(valoresIniciales.relacion_id)
      : "");
  }, [relacionTipo]);

  const agregarPaso = () => {
    const texto = pasoNuevo.trim();
    if (!texto) return;
    setProcedimiento((prev) => [...prev, texto]);
    setPasoNuevo("");
  };

  const editarPaso = (indice: number, texto: string) => {
    setProcedimiento((prev) => prev.map((paso, i) => (i === indice ? texto : paso)));
  };

  const eliminarPaso = (indice: number) => {
    setProcedimiento((prev) => prev.filter((_, i) => i !== indice));
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidated(true);
    if (!nombre.trim() || !relacionId) return;
    onSubmit({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() ? descripcion.trim() : null,
      frecuencia,
      prioridad,
      foto_obligatoria: fotoObligatoria,
      accion_correctiva: accionCorrectiva.trim() ? accionCorrectiva.trim() : null,
      procedimiento: procedimiento.length > 0 ? procedimiento : null,
      relacion_tipo: relacionTipo,
      relacion_id: Number(relacionId),
    });
  };

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Form.Group className="mb-3 text-start" controlId="formTareaPlan">
        <Form.Label className="p-1 fw-bold">Plan de Limpieza</Form.Label>
        <Form.Control plaintext readOnly value={planNombre} />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3 text-start" controlId="formTareaRelacionTipo">
            <Form.Label className="p-1 fw-bold">Aplica a *</Form.Label>
            <Form.Select
              value={relacionTipo}
              onChange={(e) => setRelacionTipo(e.target.value as RelacionTipo)}
            >
              {(Object.entries(RELACION_LABELS) as [RelacionTipo, string][]).map(([tipo, label]) => (
                <option key={tipo} value={tipo}>{label}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3 text-start" controlId="formTareaRelacionId">
            <Form.Label className="p-1 fw-bold">{RELACION_LABELS[relacionTipo]} *</Form.Label>
            <Form.Select
              required
              value={relacionId}
              onChange={(e) => setRelacionId(e.target.value)}
              disabled={cargandoOpciones}
              isInvalid={validated && !relacionId}
            >
              <option value="">Seleccione {RELACION_LABELS[relacionTipo].toLowerCase()}</option>
              {(opciones ?? []).map((opcion) => (
                <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Seleccioná {RELACION_LABELS[relacionTipo].toLowerCase()}.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      {relacionTipo && (opciones ?? []).length === 0 && !cargandoOpciones && (
        <Alert variant="warning" className="py-2">
          No hay {RELACION_LABELS[relacionTipo].toLowerCase()}s cargados todavía.
        </Alert>
      )}

      <Form.Group className="mb-3 text-start" controlId="formTareaNombre">
        <Form.Label className="p-1 fw-bold">Nombre de la Tarea *</Form.Label>
        <Form.Control
          required
          type="text"
          placeholder="Ingrese el nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          isInvalid={validated && !nombre.trim()}
        />
        <Form.Control.Feedback type="invalid">
          El nombre de la tarea es obligatorio.
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3 text-start" controlId="formTareaDescripcion">
        <Form.Label className="p-1 fw-bold">Descripción</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Ingrese la descripción del procedimiento"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3 text-start" controlId="formTareaFrecuencia">
            <Form.Label className="p-1 fw-bold">Frecuencia *</Form.Label>
            <Form.Select
              value={frecuencia}
              onChange={(e) => setFrecuencia(Number(e.target.value) as Frecuencia)}
            >
              {Object.entries(Frecuencia).map(([key, value]) => (
                <option key={key} value={value}>
                  {FRECUENCIA_LABELS[value]}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3 text-start" controlId="formTareaPrioridad">
            <Form.Label className="p-1 fw-bold">Prioridad *</Form.Label>
            <Form.Select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as Prioridad)}
            >
              {Object.entries(Prioridad).map(([key, value]) => (
                <option key={key} value={value}>
                  {PRIORIDAD_LABELS[value]}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="d-flex align-items-center">
          <Form.Group className="mb-3 text-start" controlId="formTareaFotoObligatoria">
            <Form.Check
              type="checkbox"
              label="Foto obligatoria"
              checked={fotoObligatoria}
              onChange={(e) => setFotoObligatoria(e.target.checked)}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3 text-start" controlId="formTareaAccionCorrectiva">
            <Form.Label className="p-1 fw-bold">Acción correctiva</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingrese la acción correctiva (opcional)"
              value={accionCorrectiva}
              onChange={(e) => setAccionCorrectiva(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3 text-start" controlId="formTareaProcedimiento">
        <Form.Label className="p-1 fw-bold">Procedimiento</Form.Label>

        <InputGroup className="mb-2">
          <Form.Control
            type="text"
            placeholder="Escribí un paso y agregalo"
            value={pasoNuevo}
            onChange={(e) => setPasoNuevo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregarPaso();
              }
            }}
          />
          <Button variant="outline-primary" type="button" onClick={agregarPaso}>
            <i className="bi bi-plus-lg me-1"></i>Agregar paso
          </Button>
        </InputGroup>

        {procedimiento.map((paso, indice) => (
          <InputGroup className="mb-2" key={indice}>
            <InputGroup.Text>{indice + 1}.</InputGroup.Text>
            <Form.Control
              type="text"
              value={paso}
              onChange={(e) => editarPaso(indice, e.target.value)}
            />
            <Button variant="outline-danger" type="button" onClick={() => eliminarPaso(indice)}>
              <i className="bi bi-trash3"></i>
            </Button>
          </InputGroup>
        ))}
      </Form.Group>

      <Button variant="secondary" type="button" onClick={onCancel}>
        <i className="bi bi-x-circle me-1"></i>Cancelar
      </Button>
      <Button className="ms-2" variant="primary" type="submit">
        <i className="bi bi-floppy me-1"></i> {textoBoton}
      </Button>
    </Form>
  );
}
