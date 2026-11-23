import { useState } from "react";
import { Alert, Button, Col, Form, InputGroup, ListGroup, Row } from "react-bootstrap";
import { useApi } from "../../../hooks/useApi";
import type { AlimentoReferencia, FuenteNutricional } from "../../FuenteNutricional/types";
import { DATOS_NUTRICIONALES_CAA, nutrientesATexto, type DatoNutricional} from "../types";

export type InfoNutricionalFormState = {
    fuente_nutricional_id: number | "";
    referencia_fuente: string;
    valores: Record<DatoNutricional, string>;
    modificado_respecto_fuente: boolean;
    motivo: string;
};

export const ESTADO_INFO_NUTRICIONAL_VACIO: InfoNutricionalFormState = {
    fuente_nutricional_id: "",
    referencia_fuente: "",
    valores: nutrientesATexto(),
    modificado_respecto_fuente: false,
    motivo: "",
};

interface InfoNutricionalInsumoFormProps {
    estado: InfoNutricionalFormState;
    onChange: (nuevo: InfoNutricionalFormState) => void;
    obligatoria: boolean;
    validated: boolean;
    esEdicion?: boolean;
}

export function InfoNutricionalInsumoForm({estado, onChange, obligatoria, validated, esEdicion = false}: InfoNutricionalInsumoFormProps) {
    const { data: fuentes } = useApi<FuenteNutricional[]>("/fuentes-nutricionales/");
    const fuentesActivas = (fuentes ?? []).filter((f) => f.activo);

    const [busqueda, setBusqueda] = useState("");
    const [alimentoBase, setAlimentoBase] = useState<AlimentoReferencia | null>(null);

    const urlSugerencias =
        estado.fuente_nutricional_id && busqueda.trim().length >= 2
            ? `/fuentes-nutricionales/alimentos-referencia/?fuente_id=${estado.fuente_nutricional_id}&q=${encodeURIComponent(busqueda.trim())}`
            : null;

    const { data: sugerencias } = useApi<AlimentoReferencia[]>(urlSugerencias);

    const seleccionarAlimento = (alim: AlimentoReferencia) => {
        setAlimentoBase(alim);
        onChange({
            ...estado,
            referencia_fuente: alim.codigo_externo ? `${alim.codigo_externo} - ${alim.nombre}` : alim.nombre,
            valores: nutrientesATexto(alim),
            modificado_respecto_fuente: false,
        });
        setBusqueda("");
    };

    const cambiarNutriente = (dato: DatoNutricional, valor: string) => {
        const nuevosValores = { ...estado.valores, [dato]: valor };
        const huboCambio = alimentoBase
            ? DATOS_NUTRICIONALES_CAA.some(({ dato: c }) => {
                  const actual = nuevosValores[c].trim() === "" ? null : Number(nuevosValores[c]);
                  return actual !== alimentoBase[c];
              })
            : false;

        onChange({
            ...estado,
            valores: nuevosValores,
            modificado_respecto_fuente: huboCambio,
        });
    };

    return (
        <fieldset className="mb-3 text-start border-top pt-3">
            <legend className="fs-6 fw-bold p-1 mb-1">
                Información nutricional cada 100 g o ml {obligatoria ? "(*)" : "(opcional para insumos no alimentarios)"}
            </legend>
            <p className="text-muted small px-1">
                Seleccioná una fuente nutricional y buscá un alimento de referencia para autocompletar.
            </p>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="formFuenteNutricional">
                        <Form.Label className="p-1 fw-bold">Fuente Nutricional {obligatoria && "(*)"}</Form.Label>
                        <Form.Select
                            value={estado.fuente_nutricional_id}
                            onChange={(e) => {
                                setAlimentoBase(null);
                                onChange({
                                    ...estado,
                                    fuente_nutricional_id: e.target.value ? Number(e.target.value) : "",
                                    modificado_respecto_fuente: false,
                                });
                            }}
                            isInvalid={validated && obligatoria && !estado.fuente_nutricional_id}
                        >
                            <option value="">Seleccione una fuente...</option>
                            {fuentesActivas.map((f) => (
                                <option key={f.id} value={f.id}>{f.nombre}</option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            La fuente nutricional es obligatoria.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="formReferenciaFuente">
                        <Form.Label className="p-1 fw-bold">Referencia en la Fuente {obligatoria && "(*)"}</Form.Label>
                        <Form.Control
                            type="text"
                            maxLength={200}
                            placeholder='Ej: "Harina de trigo 000" o "Ficha técnica"'
                            value={estado.referencia_fuente}
                            onChange={(e) => onChange({ ...estado, referencia_fuente: e.target.value })}
                            isInvalid={validated && obligatoria && !estado.referencia_fuente.trim()}
                        />
                        <Form.Control.Feedback type="invalid">
                            La referencia en la fuente es obligatoria.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            {estado.fuente_nutricional_id !== "" && (
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">
                        Autocompletar desde la fuente (opcional)
                    </Form.Label>
                    <InputGroup size="sm">
                        <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Escribí al menos 2 letras..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        {busqueda && (
                            <Button variant="outline-secondary" onClick={() => setBusqueda("")}>
                                Limpiar
                            </Button>
                        )}
                    </InputGroup>

                    {sugerencias && sugerencias.length > 0 && (
                        <ListGroup className="mt-1 shadow-sm" style={{ maxHeight: "180px", overflowY: "auto" }}>
                            {sugerencias.map((alim) => (
                                <ListGroup.Item
                                    key={alim.id}
                                    action
                                    type="button"
                                    onClick={() => seleccionarAlimento(alim)}
                                    className="py-1 px-2 small d-flex justify-content-between"
                                >
                                    <span>
                                        {alim.codigo_externo ? <strong>[{alim.codigo_externo}] </strong> : null}
                                        {alim.nombre}
                                    </span>
                                    <span className="text-muted">
                                        {alim.valor_energetico ?? "-"} kcal | Na: {alim.sodio ?? "-"} mg
                                    </span>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}

                    {estado.modificado_respecto_fuente && (
                        <Alert variant="info" className="py-1 px-2 mt-2 mb-0 small">
                            <i className="bi bi-info-circle me-1"></i>
                            Se registrará como dato modificado respecto a la fuente.
                        </Alert>
                    )}
                </Form.Group>
            )}
            <Row>
                {DATOS_NUTRICIONALES_CAA.map(({ dato, etiqueta, unidad }) => {
                    const vacio = estado.valores[dato].trim() === "";
                    const negativo = !vacio && Number(estado.valores[dato]) < 0;
                    const invalido = validated && ((obligatoria && vacio) || negativo);

                    return (
                        <Col sm={6} key={dato}>
                            <Form.Group className="mb-3" controlId={`form_${dato}`}>
                                <Form.Label className="p-1 fw-bold">{etiqueta}</Form.Label>
                                <InputGroup hasValidation>
                                    <Form.Control
                                        type="number"
                                        min={0}
                                        step="any"
                                        placeholder="0"
                                        value={estado.valores[dato]}
                                        onChange={(e) => cambiarNutriente(dato, e.target.value)}
                                        isInvalid={invalido}
                                    />
                                    <InputGroup.Text>{unidad}</InputGroup.Text>
                                    <Form.Control.Feedback type="invalid">
                                        {negativo ? "No puede ser negativo." : "Este valor es obligatorio."}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    );
                })}
            </Row>
            {esEdicion && (
                <Form.Group className="mb-2" controlId="formMotivoModificacion">
                    <Form.Label className="p-1 fw-bold">Motivo de la modificación (opcional)</Form.Label>
                    <Form.Control
                        type="text"
                        maxLength={500}
                        placeholder="Ej: Actualización según nueva ficha técnica del proveedor"
                        value={estado.motivo}
                        onChange={(e) => onChange({ ...estado, motivo: e.target.value })}
                    />
                </Form.Group>
            )}
        </fieldset>
    );
}




