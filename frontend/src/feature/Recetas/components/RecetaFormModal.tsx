import { useEffect, useState } from 'react';
import { Accordion, Badge, Button, Col, Form, InputGroup, Modal, Row, Spinner } from 'react-bootstrap';
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

interface RecetaFormModalProps {
    producto: Producto | null;
    // Si se pasa una receta el modal la edita; si no, da de alta una nueva desde la plantilla
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
    rendimiento: string;
    rendimiento_unidad_medida_id: string;
    porcion: string;
    porcion_unidad_medida_id: string;
    insumos: InsumoRecetaFormData[];
    etapas: NewEtapaReceta[];
}

const MENSAJE_SIN_INGREDIENTES = "La receta debe tener al menos un ingrediente.";

const renglonVacio = (tipo: TipoRenglon): InsumoRecetaFormData => ({ insumo_id: "", cantidad: "", tipo, aditivo_id: "" });

const plantillaInicial = (producto: Producto | null): RecetaFormData => ({
    rendimiento: producto ? String(producto.cantidad_neta) : "",
    rendimiento_unidad_medida_id: producto ? String(producto.unidad_medida_id) : "",
    porcion: "",
    porcion_unidad_medida_id: "",
    insumos: [renglonVacio("Ingrediente")],
    etapas: PLANTILLA_ETAPAS.map((etapa) => ({ ...etapa, pasos: etapa.pasos.map((paso) => ({ ...paso })) })),
});

const aTexto = (valor: number | null) => (valor === null ? "" : String(valor));

const valoresDeReceta = (receta: Receta): RecetaFormData => ({
    rendimiento: aTexto(receta.rendimiento),
    rendimiento_unidad_medida_id: aTexto(receta.rendimiento_unidad_medida_id),
    porcion: aTexto(receta.porcion),
    porcion_unidad_medida_id: aTexto(receta.porcion_unidad_medida_id),
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

export function RecetaFormModal({ producto, receta, onHide, onSaved }: RecetaFormModalProps) {
    const [cargando, setCargando] = useState(false);
    const esEdicion = Boolean(receta);

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<RecetaFormData>({
        defaultValues: plantillaInicial(null),
    });
    const { fields: etapas, append, remove } = useFieldArray({ control, name: "etapas" });
    const etapasActuales = useWatch({ control, name: "etapas" });

    // Cada vez que se abre arranca con la receta a editar o, en el alta, con la plantilla
    useEffect(() => {
        if (producto) reset(receta ? valoresDeReceta(receta) : plantillaInicial(producto));
    }, [producto, receta, reset]);

    const onSubmit = async (data: RecetaFormData) => {
        if (!producto) return;

        setCargando(true);
        try {
            const datos: NewRecetaVersion = {
                rendimiento: Number(data.rendimiento),
                rendimiento_unidad_medida_id: Number(data.rendimiento_unidad_medida_id),
                porcion: data.porcion.trim() ? Number(data.porcion) : null,
                porcion_unidad_medida_id: data.porcion_unidad_medida_id ? Number(data.porcion_unidad_medida_id) : null,
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
            onHide();
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
        <Modal show={producto !== null} onHide={onHide} size="lg" scrollable>
            <Form onSubmit={handleSubmit(onSubmit)} noValidate className="d-flex flex-column overflow-hidden">
                <Modal.Header closeButton>
                    <Modal.Title>{esEdicion ? 'Editar receta' : 'Nueva receta'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1"><strong>Producto:</strong> {producto?.nombre}</p>
                    <p className="text-muted small mb-3">
                        {esEdicion
                            ? `Al guardar se crea la versión ${(receta?.version ?? 0) + 1} de la receta. La versión ${receta?.version} queda en el historial como solo lectura.`
                            : 'La receta se carga con una plantilla de ejemplo. Eliminá las etapas y pasos que no correspondan y agregá los que necesites.'}
                        {' '}El orden de etapas y pasos es el orden en que aparecen.
                    </p>

                    <RendimientoReceta register={register} errors={errors} receta={receta} />

                    <IngredientesReceta
                        control={control}
                        register={register}
                        errors={errors}
                        producto={producto}
                        receta={receta}
                    />

                    <h6 className="fw-bold text-start mt-4 mb-2">Etapas y pasos</h6>
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
                </Modal.Body>
                <Modal.Footer className="justify-content-start">
                    <Button variant="secondary" onClick={onHide} disabled={cargando}>Cancelar</Button>
                    <Button variant="success" type="submit" disabled={cargando}>
                        {cargando ? "Guardando..." : esEdicion ? "Guardar nueva versión" : "Guardar receta"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

interface RendimientoRecetaProps {
    register: UseFormRegister<RecetaFormData>;
    errors: FieldErrors<RecetaFormData>;
    receta?: Receta | null;
}

function RendimientoReceta({ register, errors, receta }: RendimientoRecetaProps) {
    const { data: unidadesMedida } = useApi<UnidadMedida[]>("/unidades-medida/");
    const idsDeReceta = new Set([receta?.rendimiento_unidad_medida_id, receta?.porcion_unidad_medida_id]);
    const unidades = (unidadesMedida ?? []).filter((unidad) => unidad.activo || idsDeReceta.has(unidad.id));

    return (
        <div className="text-start mb-3">
            <h6 className="fw-bold mb-1">Rendimiento y porción</h6>
            <p className="text-muted small mb-2">
                Indicá cuánto producto final se obtiene con las cantidades de la receta y, si corresponde, la porción o unidad de venta.
            </p>
            {!unidadesMedida ? (
                <div className="d-flex align-items-center gap-2 text-muted small">
                    <Spinner animation="border" size="sm" /> Cargando unidades de medida…
                </div>
            ) : (
                <Row className="g-2">
                    <Col sm={6}>
                        <Form.Label className="p-1 fw-bold small mb-0">Rendimiento final *</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="number"
                                min={0}
                                step="any"
                                placeholder="Cantidad"
                                {...register("rendimiento", {
                                    required: "El rendimiento final es obligatorio.",
                                    validate: (valor) => Number(valor) > 0 || "El rendimiento debe ser mayor a 0.",
                                })}
                                isInvalid={!!errors.rendimiento}
                            />
                            <Form.Select
                                {...register("rendimiento_unidad_medida_id", { required: "Seleccioná la unidad del rendimiento." })}
                                isInvalid={!!errors.rendimiento_unidad_medida_id}
                                style={{ maxWidth: '10rem' }}
                            >
                                <option value="">-</option>
                                {unidades.map((unidad) => <option key={unidad.id} value={unidad.id}>{unidad.nombre}</option>)}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.rendimiento?.message ?? errors.rendimiento_unidad_medida_id?.message}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Col>
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
                </Row>
            )}
        </div>
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
    const rendimiento = useWatch({ control, name: "rendimiento" });
    const rendimientoUnidadId = useWatch({ control, name: "rendimiento_unidad_medida_id" });
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
    const rendimientoValido = Number(rendimiento) > 0 && rendimientoUnidadId !== "";
    const consulta = JSON.stringify({
        items,
        rendimiento: rendimientoValido ? Number(rendimiento) : null,
        rendimiento_unidad_medida_id: rendimientoValido ? Number(rendimientoUnidadId) : null,
    });
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
                    rendimiento: datosConsulta.rendimiento,
                    rendimiento_unidad_medida_id: datosConsulta.rendimiento_unidad_medida_id,
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
        <div className="text-start mb-2">
            <h6 className="fw-bold mb-1">Ingredientes y aditivos</h6>
            <p className="text-muted small mb-2">
                Indicá la cantidad de cada insumo que se usa para obtener el rendimiento final. Clasificá cada renglón como ingrediente o aditivo; los aditivos se eligen de la lista de referencia.
            </p>

            {insumos.map((item, index) => {
                const errorInsumo = errors.insumos?.[index]?.insumo_id;
                const errorCantidad = errors.insumos?.[index]?.cantidad;
                const errorAditivo = errors.insumos?.[index]?.aditivo_id;
                const esAditivo = insumosActuales?.[index]?.tipo === "Aditivo";
                return (
                    <div key={item.id} className={`border rounded p-2 mb-2 ${esAditivo ? 'bg-light' : ''}`}>
                        <div className="d-flex align-items-start gap-2 flex-wrap flex-sm-nowrap">
                            <Form.Select
                                size="sm"
                                className="mt-1"
                                style={{ width: '8.5rem' }}
                                aria-label="Tipo de renglón"
                                {...register(`insumos.${index}.tipo`)}
                            >
                                <option value="Ingrediente">Ingrediente</option>
                                <option value="Aditivo">Aditivo</option>
                            </Form.Select>
                            <div className="flex-grow-1">
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
                            </div>
                            <div style={{ width: '12rem' }}>
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
                                    <InputGroup.Text>{unidadDeInsumo(insumosActuales?.[index]?.insumo_id) ?? '-'}</InputGroup.Text>
                                    <Form.Control.Feedback type="invalid">{errorCantidad?.message}</Form.Control.Feedback>
                                </InputGroup>
                            </div>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                className="mt-1"
                                onClick={() => remove(index)}
                                title="Eliminar renglón"
                            >
                                <i className="bi bi-x-lg"></i>
                            </Button>
                        </div>
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

            <SellosFrontales evaluacion={evaluacion} cargando={calculando} />
        </div>
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
