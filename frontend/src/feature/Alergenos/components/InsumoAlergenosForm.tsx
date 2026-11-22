import { Badge, Col, Form, Row } from "react-bootstrap";
import { useApi } from "../../../hooks/useApi";
import type { Alergeno, InsumoAlergenoItem, InsumoAlergenosUpdate } from "../types";

interface InsumoAlergenosFieldsProps {
    valor: InsumoAlergenosUpdate;
    onChange: (nuevo: InsumoAlergenosUpdate) => void;
}

export function InsumoAlergenosForm({ valor, onChange }: InsumoAlergenosFieldsProps) {
    const { data: alergenos, isLoading } = useApi<Alergeno[]>("/alergenos/");
    const alergenosActivos = (alergenos ?? []).filter((alergeno) => alergeno.activo);

    const hayAlergenoConTacc = alergenosActivos.some((alergeno) => alergeno.es_tacc && valor.alergenos.some((item) => item.alergeno_id === alergeno.id));

    const seleccionarAlergeno = (alergeno: Alergeno, estaSeleccionado: boolean) => {
        const nuevosAlergenos: InsumoAlergenoItem[] = estaSeleccionado
            ? [...valor.alergenos, { alergeno_id: alergeno.id, es_derivado: false }]
            : valor.alergenos.filter((item) => item.alergeno_id !== alergeno.id);

        const sigueConTacc = alergenosActivos.some(
            (itemCatalogo) =>
                itemCatalogo.es_tacc &&
                nuevosAlergenos.some((item) => item.alergeno_id === itemCatalogo.id)
        );

        onChange({contiene_gluten: sigueConTacc ? true : valor.contiene_gluten, alergenos: nuevosAlergenos});
    };

    const cambiarSiEsDerivado = (alergenoId: number, esDerivado: boolean) => {
        onChange({
            ...valor,
            alergenos: valor.alergenos.map((item) =>
                item.alergeno_id === alergenoId ? { ...item, es_derivado: esDerivado } : item
            ),
        });
    };

    return (
        <fieldset className="mb-3 text-start border-top pt-3">
            <legend className="fs-6 fw-bold p-1 mb-1">Alérgenos y Gluten (TACC)</legend>
            <p className="text-muted small px-1">
                Seleccioná los alérgenos presentes en el insumo e indicá si provienen de un derivado.
            </p>

            <div className="p-2 mb-3 rounded border bg-light">
                <Form.Check
                    type="switch"
                    id="form_contiene_gluten"
                    label={ <span className="fw-semibold"> Contiene gluten (No apto celíacos / Con TACC) </span> }
                    checked={hayAlergenoConTacc || valor.contiene_gluten}
                    disabled={hayAlergenoConTacc}
                    onChange={(evento) => onChange({ ...valor, contiene_gluten: evento.target.checked })}
                />
                {hayAlergenoConTacc && (
                    <Form.Text className="text-warning-emphasis d-block mt-1">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Activado automáticamente porque seleccionaste un alérgeno con TACC.
                    </Form.Text>
                )}
            </div>

            {isLoading ? (
                <p className="text-muted small px-1">Cargando catálogo de alérgenos...</p>
            ) : alergenosActivos.length === 0 ? (
                <p className="text-muted small px-1 fst-italic">No hay alérgenos activos cargados.</p>
            ) : (
                <Row className="g-2">
                    {alergenosActivos.map((alergeno) => {
                        const alergenoElegido = valor.alergenos.find((item) => item.alergeno_id === alergeno.id);

                        return (
                            <Col sm={6} key={alergeno.id}>
                                <div
                                    className={`p-2 rounded border h-100 ${
                                        alergenoElegido
                                            ? "border-primary bg-primary-subtle bg-opacity-10"
                                            : "bg-white"
                                    }`}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <Form.Check
                                            type="checkbox"
                                            id={`alergeno_${alergeno.id}`}
                                            label={
                                                <span>
                                                    {alergeno.nombre}{" "}
                                                    {alergeno.es_tacc && (
                                                        <Badge bg="warning" text="dark" className="ms-1">
                                                            TACC
                                                        </Badge>
                                                    )}
                                                </span>
                                            }
                                            checked={Boolean(alergenoElegido)}
                                            onChange={(evento) => seleccionarAlergeno(alergeno, evento.target.checked)}
                                        />
                                    </div>

                                    {alergenoElegido && (
                                        <div className="mt-2 ps-4">
                                            <Form.Check
                                                type="switch"
                                                id={`derivado_${alergeno.id}`}
                                                label={<span className="small text-secondary"> Es derivado </span>}
                                                checked={alergenoElegido.es_derivado}
                                                onChange={(evento) =>
                                                    cambiarSiEsDerivado(alergeno.id, evento.target.checked)
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </fieldset>
    );
}