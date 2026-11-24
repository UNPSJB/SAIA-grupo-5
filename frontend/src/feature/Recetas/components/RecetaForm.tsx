import { useEffect, useState } from 'react';
import { Accordion, Badge, Button, ButtonGroup, Card, Col, Form, InputGroup, Row, Spinner, ToggleButton } from 'react-bootstrap';
import { Controller, useFieldArray, useForm, useWatch, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { isAxiosError } from 'axios';
import { api } from '../../../libs/axios';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { Producto } from '../../Productos/types';
import type { Insumo } from '../../Insumos/types';
import type { UnidadMedida } from '../../UnidadMedida/types';
import { etiquetaAditivo, type Aditivo } from '../../Aditivos/types';
import type { EvaluacionSellos, NewEtapaReceta, NewInsumoReceta, NewReceta, NewRecetaVersion, Receta, TipoRenglon } from '../types';
import { PLANTILLA_ETAPAS } from '../constants';
import { useApi } from '../../../hooks/useApi';
import { SelectorConBusqueda } from '../../../components/SelectorConBusqueda';
import { SellosFrontales } from './SellosFrontales';
import { TituloSeccion } from './TituloSeccion';
import './RecetaForm.css';

const TIPOS_RENGLON: TipoRenglon[] = ["Ingrediente", "Aditivo"];

interface RecetaFormProps {
    producto: Producto | null;
    receta?: Receta | null;
    onHide: () => void;
    onSaved: (receta: Receta) => void;
}

interface InsumoRecetaFormData {
    insumo_id: string;
    cantidad: string;
    tipo: TipoRenglon;
    aditivo_id: string;
}

interface RecetaFormData {
    porcion: string;
    porcion_unidad_medida_id: string;
    medida_casera: string;
    insumos: InsumoRecetaFormData[];
    etapas: NewEtapaReceta[];
}

const MENSAJE_SIN_INGREDIENTES = "La receta debe tener al menos un ingrediente.";

const renglonVacio = (tipo: TipoRenglon): InsumoRecetaFormData => ({ insumo_id: "", cantidad: "", tipo, aditivo_id: "" });

const plantillaInicial = (): RecetaFormData => ({
    porcion: "",
    porcion_unidad_medida_id: "",
    medida_casera: "",
    insumos: [renglonVacio("Ingrediente")],
    etapas: PLANTILLA_ETAPAS.map((etapa) => ({ ...etapa, pasos: etapa.pasos.map((paso) => ({ ...paso })) })),
});

const aTexto = (valor: number | null) => (valor === null ? "" : String(valor));

const valoresDeReceta = (receta: Receta): RecetaFormData => ({
    porcion: aTexto(receta.porcion),
    porcion_unidad_medida_id: aTexto(receta.porcion_unidad_medida_id),
    medida_casera: receta.medida_casera ?? "",
    insumos: (receta.insumos ?? []).map((item) => ({
        insumo_id: String(item.insumo_id),
        cantidad: String(item.cantidad),
        tipo: item.tipo,
        aditivo_id: aTexto(item.aditivo_id),
    })),
    etapas: receta.etapas.map((etapa) => ({
        nombre: etapa.nombre,
        pasos: etapa.pasos.map((paso) => ({ descripcion: paso.descripcion })),
    })),
});

const aRenglon = (item: InsumoRecetaFormData): NewInsumoReceta => ({
    insumo_id: Number(item.insumo_id),
    cantidad: Number(item.cantidad),
    tipo: item.tipo,
    aditivo_id: item.tipo === "Aditivo" && item.aditivo_id ? Number(item.aditivo_id) : null,
});

const insumosValidos = (insumos: InsumoRecetaFormData[] = []): NewInsumoReceta[] => {
    const vistos = new Set<string>();
    return insumos
        .filter((item) => item?.insumo_id && Number(item.cantidad) > 0 && !vistos.has(item.insumo_id) && Boolean(vistos.add(item.insumo_id)))
        .map((item) => ({ ...aRenglon(item), tipo: "Ingrediente" as TipoRenglon, aditivo_id: null }));
};

export function RecetaForm({ producto, receta, onHide, onSaved }: RecetaFormProps) {
    const [cargando, setCargando] = useState(false);
    const esEdicion = Boolean(receta);

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<RecetaFormData>({
        defaultValues: plantillaInicial(),
    });
    const { fields: etapas, append, remove } = useFieldArray({ control, name: "etapas" });
    const etapasActuales = useWatch({ control, name: "etapas" });

    // Al cargar el producto, inicializa el formulario con la receta o la plantilla
    useEffect(() => {
        if (producto) reset(receta ? valoresDeReceta(receta) : plantillaInicial());
    }, [producto, receta, reset]);

    const onSubmit = async (data: RecetaFormData) => {
        if (!producto) return;

        setCargando(true);
        try {
            const datos: NewRecetaVersion = {
                porcion: data.porcion.trim() ? Number(data.porcion) : null,
                porcion_unidad_medida_id: data.porcion_unidad_medida_id ? Number(data.porcion_unidad_medida_id) : null,
                medida_casera: data.medida_casera.trim() || null,
                etapas: data.etapas.map((etapa) => ({
                    nombre: etapa.nombre.trim(),
                    pasos: etapa.pasos.map((paso) => ({ descripcion: paso.descripcion.trim() })),
                })),
                insumos: data.insumos.map(aRenglon),
            };
            const { data: guardada } = receta
                ? await api.put<Receta>(`/recetas/${receta.id}`, datos)
                : await api.post<Receta>("/recetas/", { producto_id: producto.id, ...datos } satisfies NewReceta);
            mostrarAlertaExito(esEdicion
                ? `Se creó la versión ${guardada.version} de la receta del producto '${producto.nombre}'.`
                : `La receta del producto '${producto.nombre}' se creó correctamente.`);
            onSaved(guardada);
        } catch (error) {
            let mensajeFinal = `No se pudo ${esEdicion ? 'actualizar' : 'crear'} la receta del producto '${producto.nombre}'.`;
            const detail = isAxiosError(error) ? error.response?.data?.detail : undefined;
            if (detail) {
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        } finally {
            setCargando(false);
        }
    };

    return (
        <Card className="shadow-sm border-0 rounded-3 mt-3">
            <Form onSubmit={handleSubmit(onSubmit)} noValidate className="d-flex flex-column overflow-hidden">
                <Card.Body className="p-4">
                    <section className="seccion-receta text-start">
                        <TituloSeccion titulo="Producto" />
                        <p className="fs-5 fw-semibold mb-1">{producto?.nombre}</p>
                        <p className="text-muted small mb-0">
                            {esEdicion
                                ? `Al guardar se crea la versión ${(receta?.version ?? 0) + 1} de la receta. La versión ${receta?.version} queda en el historial como solo lectura.`
                                : 'La receta se carga con una plantilla de ejemplo. Eliminá las etapas y pasos que no correspondan y agregá los que necesites.'}
                            {' '}El orden de etapas y pasos es el orden en que aparecen.
                        </p>
                    </section>

                    <RendimientoReceta register={register} errors={errors} receta={receta} />

                    <IngredientesReceta
                        control={control}
                        register={register}
                        errors={errors}
                        producto={producto}
                        receta={receta}
                    />

                    <section className="seccion-receta">
                        <TituloSeccion titulo="Etapas y pasos" />
                        <Accordion alwaysOpen defaultActiveKey={["0"]}>
                            {etapas.map((etapa, index) => (
                                <Accordion.Item key={etapa.id} eventKey={String(index)}>
                                    <Accordion.Header>
                                        <span className="fw-semibold me-2">{index + 1}.</span>
                                        {etapasActuales?.[index]?.nombre || <span className="text-muted">Etapa sin nombre</span>}
                                        {errors.etapas?.[index] && <Badge bg="danger" className="ms-2">Revisar</Badge>}
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <Form.Group className="mb-3 text-start" controlId={`formEtapaNombre${index}`}>
                                            <Form.Label className="p-1 fw-bold">Nombre de la etapa *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Ingrese el nombre"
                                                {...register(`etapas.${index}.nombre`, {
                                                    required: "El nombre de la etapa es obligatorio.",
                                                    validate: (valor) => valor.trim() !== "" || "El nombre de la etapa es obligatorio.",
                                                    maxLength: { value: 80, message: "El nombre no puede superar los 80 caracteres." },
                                                })}
                                                isInvalid={!!errors.etapas?.[index]?.nombre}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.etapas?.[index]?.nombre?.message}</Form.Control.Feedback>
                                        </Form.Group>

                                        <PasosEtapa control={control} register={register} errors={errors} etapaIndex={index} />

                                        <div className="d-flex justify-content-end mt-3">
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => remove(index)}
                                                disabled={etapas.length === 1}
                                                title={etapas.length === 1 ? "La receta debe tener al menos una etapa" : undefined}
                                            >
                                                <i className="bi bi-trash me-1"></i>Eliminar etapa
                                            </Button>
                                        </div>
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>

                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="mt-3"
                            onClick={() => append({ nombre: "", pasos: [{ descripcion: "" }] })}
                        >
                            <i className="bi bi-plus-lg me-1"></i>Agregar etapa
                        </Button>
                    </section>
                </Card.Body>
                <Card.Footer className="bg-white d-flex gap-2">
                    <Button variant="secondary" onClick={onHide} disabled={cargando}>Cancelar</Button>
                    <Button variant="success" type="submit" disabled={cargando}>
                        {cargando ? "Guardando..." : esEdicion ? "Guardar nueva versión" : "Guardar receta"}
                    </Button>
                </Card.Footer>
            </Form>
        </Card>
    );
}

interface RendimientoRecetaProps {
    register: UseFormRegister<RecetaFormData>;
    errors: FieldErrors<RecetaFormData>;
    receta?: Receta | null;
}

function RendimientoReceta({ register, errors, receta }: RendimientoRecetaProps) {
    const { data: unidadesMedida } = useApi<UnidadMedida[]>("/unidades-medida/");
    const idsDeReceta = new Set([receta?.porcion_unidad_medida_id]);
    const unidades = (unidadesMedida ?? []).filter((unidad) => unidad.activo || idsDeReceta.has(unidad.id));

    return (
        <section className="seccion-receta text-start">
            <TituloSeccion titulo="Porción" />
            <p className="text-muted small mb-2">
                Si corresponde, indicá la porción o unidad de venta.
            </p>
            {!unidadesMedida ? (
                <div className="d-flex align-items-center gap-2 text-muted small">
                    <Spinner animation="border" size="sm" /> Cargando unidades de medida…
                </div>
            ) : (
                <Row className="g-2">
                    <Col sm={6}>
                        <Form.Label className="p-1 fw-bold small mb-0">Porción o unidad de venta</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="number"
                                min={0}
                                step="any"
                                placeholder="Opcional"
                                {...register("porcion", {
                                    validate: (valor, datos) => {
                                        if (valor.trim() === "") return datos.porcion_unidad_medida_id === "" || "Indicá la cantidad de la porción.";
                                        return Number(valor) > 0 || "La porción debe ser mayor a 0.";
                                    },
                                })}
                                isInvalid={!!errors.porcion}
                            />
                            <Form.Select
                                {...register("porcion_unidad_medida_id", {
                                    validate: (valor, datos) => valor !== "" || datos.porcion.trim() === "" || "Seleccioná la unidad de la porción.",
                                })}
                                isInvalid={!!errors.porcion_unidad_medida_id}
                                className="unidad-select"
                                style={{ maxWidth: '10rem' }}
                            >
                                <option value="">-</option>
                                {unidades.map((unidad) => <option key={unidad.id} value={unidad.id}>{unidad.nombre}</option>)}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.porcion?.message ?? errors.porcion_unidad_medida_id?.message}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Col>
                    <Col sm={6}>
                        <Form.Label className="p-1 fw-bold small mb-0">Medida casera</Form.Label>
                        <Form.Control
                            type="text"
                            maxLength={100}
                            placeholder="Ej: 1 cucharada sopera (15 g)"
                            {...register("medida_casera", {
                                maxLength: { value: 100, message: "La medida casera no puede superar los 100 caracteres." },
                            })}
                            isInvalid={!!errors.medida_casera}
                        />
                        <Form.Control.Feedback type="invalid">{errors.medida_casera?.message}</Form.Control.Feedback>
                    </Col>
                </Row>
            )}
        </section>
    );
}

interface IngredientesRecetaProps {
    control: Control<RecetaFormData>;
    register: UseFormRegister<RecetaFormData>;
    errors: FieldErrors<RecetaFormData>;
    producto: Producto | null;
    receta?: Receta | null;
}

function IngredientesReceta({ control, register, errors, producto, receta }: IngredientesRecetaProps) {
    const { fields: insumos, append, remove } = useFieldArray({
        control,
        name: "insumos",
        rules: { validate: (items) => items.some((item) => item.tipo === "Ingrediente") || MENSAJE_SIN_INGREDIENTES },
    });
    const insumosActuales = useWatch({ control, name: "insumos" });
    const { data: insumosDisponibles } = useApi<Insumo[]>(producto ? "/insumos/" : null);
    const { data: aditivosDisponibles } = useApi<Aditivo[]>(producto ? "/aditivos/" : null);
    const [resultado, setResultado] = useState<{ consulta: string; evaluacion: EvaluacionSellos | null } | null>(null);

    const idsDeReceta = new Set((receta?.insumos ?? []).map((item) => item.insumo_id));
    const opciones = (insumosDisponibles ?? [])
        .filter((insumo) => insumo.activo || idsDeReceta.has(insumo.id))
        .map((insumo) => ({
            value: String(insumo.id),
            label: `${insumo.nombre} (${insumo.unidad_medida.nombre})${insumo.valor_energetico === null ? ' · sin información nutricional' : ''}`,
        }));

    const aditivosDeReceta = new Set((receta?.insumos ?? []).map((item) => item.aditivo_id));
    const opcionesAditivos = (aditivosDisponibles ?? [])
        .filter((aditivo) => aditivo.activo || aditivosDeReceta.has(aditivo.id))
        .map((aditivo) => ({ value: String(aditivo.id), label: etiquetaAditivo(aditivo) }));

    const items = insumosValidos(insumosActuales);
    const consulta = JSON.stringify({ items });
    const hayItems = items.length > 0;
    const calculando = hayItems && resultado?.consulta !== consulta;
    const evaluacion = hayItems && !calculando ? resultado?.evaluacion ?? null : null;

    useEffect(() => {
        const datosConsulta = JSON.parse(consulta);
        if (!producto || datosConsulta.items.length === 0) return;

        let vigente = true;
        const temporizador = setTimeout(async () => {
            try {
                const { data } = await api.post<EvaluacionSellos>("/recetas/sellos", {
                    producto_id: producto.id,
                    insumos: datosConsulta.items,
                });
                if (vigente) setResultado({ consulta, evaluacion: data });
            } catch (error) {
                if (vigente) setResultado({ consulta, evaluacion: null });
                console.log(error);
            }
        }, 400);

        return () => {
            vigente = false;
            clearTimeout(temporizador);
        };
    }, [consulta, producto]);

    const unidadDeInsumo = (insumoId?: string) =>
        insumosDisponibles?.find((insumo) => String(insumo.id) === insumoId)?.unidad_medida.nombre;

    return (
        <>
            <section className="seccion-receta text-start">
                <TituloSeccion titulo="Ingredientes y aditivos" />
                <p className="text-muted small mb-2">
                    Indicá la cantidad de cada insumo. Clasificá cada renglón como ingrediente o aditivo; los aditivos se eligen de la lista de referencia.
                </p>

                {insumos.map((item, index) => {
                    const errorInsumo = errors.insumos?.[index]?.insumo_id;
                    const errorCantidad = errors.insumos?.[index]?.cantidad;
                    const errorAditivo = errors.insumos?.[index]?.aditivo_id;
                    const esAditivo = insumosActuales?.[index]?.tipo === "Aditivo";
                    return (
                        <div key={item.id} className={`renglon-receta ${esAditivo ? 'renglon-receta-aditivo' : ''}`}>
                            <Row className="g-2 align-items-start">
                                <Col xs="auto">
                                    <Controller
                                        control={control}
                                        name={`insumos.${index}.tipo`}
                                        render={({ field }) => (
                                            <ButtonGroup className="tipo-renglon" aria-label="Tipo de renglón">
                                                {TIPOS_RENGLON.map((tipo) => (
                                                    <ToggleButton
                                                        key={tipo}
                                                        id={`tipo-${item.id}-${tipo}`}
                                                        type="radio"
                                                        variant="outline-secondary"
                                                        name={`tipo-${item.id}`}
                                                        value={tipo}
                                                        checked={field.value === tipo}
                                                        onChange={(e) => field.onChange(e.currentTarget.value as TipoRenglon)}
                                                    >
                                                        {tipo}
                                                    </ToggleButton>
                                                ))}
                                            </ButtonGroup>
                                        )}
                                    />
                                </Col>
                                <Col xs={12} md>
                                    <Controller
                                        control={control}
                                        name={`insumos.${index}.insumo_id`}
                                        rules={{
                                            required: "Seleccioná un insumo.",
                                            validate: (valor, datos) =>
                                                datos.insumos.filter((otro) => otro.insumo_id === valor).length === 1 || "El insumo ya fue agregado.",
                                        }}
                                        render={({ field }) => (
                                            <SelectorConBusqueda
                                                value={field.value}
                                                options={opciones}
                                                onChange={field.onChange}
                                                placeholder="Seleccionar insumo..."
                                            />
                                        )}
                                    />
                                    {errorInsumo && <div className="text-danger small mt-1">{errorInsumo.message}</div>}
                                </Col>
                                <Col xs md={3}>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            type="number"
                                            min={0}
                                            step="any"
                                            placeholder="Cantidad"
                                            {...register(`insumos.${index}.cantidad`, {
                                                required: "La cantidad es obligatoria.",
                                                validate: (valor) => Number(valor) > 0 || "La cantidad debe ser mayor a 0.",
                                            })}
                                            isInvalid={!!errorCantidad}
                                        />
                                        <InputGroup.Text className="unidad-renglon">{unidadDeInsumo(insumosActuales?.[index]?.insumo_id) ?? '-'}</InputGroup.Text>
                                        <Form.Control.Feedback type="invalid">{errorCantidad?.message}</Form.Control.Feedback>
                                    </InputGroup>
                                </Col>
                                <Col xs="auto">
                                    <Button
                                        variant="outline-danger"
                                        onClick={() => remove(index)}
                                        title="Eliminar renglón"
                                        aria-label="Eliminar renglón"
                                    >
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </Col>
                            </Row>
                            {esAditivo && (
                                <div className="mt-2">
                                    <Controller
                                        control={control}
                                        name={`insumos.${index}.aditivo_id`}
                                        rules={{
                                            validate: (valor, datos) =>
                                                datos.insumos[index]?.tipo !== "Aditivo" || valor !== "" || "Seleccioná la clase funcional, el nombre y el INS del aditivo.",
                                        }}
                                        render={({ field }) => (
                                            <SelectorConBusqueda
                                                value={field.value}
                                                options={opcionesAditivos}
                                                onChange={field.onChange}
                                                placeholder="Clase funcional · nombre (INS)..."
                                            />
                                        )}
                                    />
                                    {errorAditivo && <div className="text-danger small mt-1">{errorAditivo.message}</div>}
                                </div>
                            )}
                        </div>
                    );
                })}

                {errors.insumos?.root && <div className="text-danger small mb-2">{errors.insumos.root.message}</div>}

                <div className="d-flex gap-3 mb-2">
                    <Button variant="link" size="sm" className="px-0" onClick={() => append(renglonVacio("Ingrediente"))}>
                        <i className="bi bi-plus-lg me-1"></i>Agregar ingrediente
                    </Button>
                    <Button variant="link" size="sm" className="px-0" onClick={() => append(renglonVacio("Aditivo"))}>
                        <i className="bi bi-plus-lg me-1"></i>Agregar aditivo
                    </Button>
                </div>

            </section>

            <section className="seccion-receta text-start">
                <TituloSeccion titulo="Sellos de advertencia (etiquetado frontal)" />
                <SellosFrontales evaluacion={evaluacion} cargando={calculando} mostrarTitulo={false} />
            </section>
        </>
    );
}

interface PasosEtapaProps {
    control: Control<RecetaFormData>;
    register: UseFormRegister<RecetaFormData>;
    errors: FieldErrors<RecetaFormData>;
    etapaIndex: number;
}

function PasosEtapa({ control, register, errors, etapaIndex }: PasosEtapaProps) {
    const { fields: pasos, append, remove } = useFieldArray({ control, name: `etapas.${etapaIndex}.pasos` });

    return (
        <div className="text-start">
            <Form.Label className="p-1 fw-bold">Pasos *</Form.Label>
            {pasos.map((paso, index) => {
                const error = errors.etapas?.[etapaIndex]?.pasos?.[index]?.descripcion;
                return (
                    <div key={paso.id} className="d-flex align-items-start gap-2 mb-2">
                        <span className="text-muted pt-2" style={{ minWidth: '1.5rem' }}>{index + 1}.</span>
                        <div className="flex-grow-1">
                            <Form.Control
                                type="text"
                                placeholder="Descripción del paso"
                                {...register(`etapas.${etapaIndex}.pasos.${index}.descripcion`, {
                                    required: "La descripción del paso es obligatoria.",
                                    validate: (valor) => valor.trim() !== "" || "La descripción del paso es obligatoria.",
                                    maxLength: { value: 500, message: "La descripción no puede superar los 500 caracteres." },
                                })}
                                isInvalid={!!error}
                            />
                            <Form.Control.Feedback type="invalid">{error?.message}</Form.Control.Feedback>
                        </div>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            className="mt-1"
                            onClick={() => remove(index)}
                            disabled={pasos.length === 1}
                            title={pasos.length === 1 ? "La etapa debe tener al menos un paso" : "Eliminar paso"}
                        >
                            <i className="bi bi-x-lg"></i>
                        </Button>
                    </div>
                );
            })}
            <Button variant="link" size="sm" className="px-0" onClick={() => append({ descripcion: "" })}>
                <i className="bi bi-plus-lg me-1"></i>Agregar paso
            </Button>
        </div>
    );
}
