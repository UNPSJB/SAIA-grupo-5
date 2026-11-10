import { useEffect, useState } from 'react';
import { Accordion, Badge, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { Controller, useFieldArray, useForm, useWatch, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { isAxiosError } from 'axios';
import { api } from '../../../libs/axios';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { Producto } from '../../Productos/types';
import type { Insumo } from '../../Insumos/types';
import type { EvaluacionSellos, NewEtapaReceta, NewInsumoReceta, NewReceta, Receta } from '../types';
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
}

interface RecetaFormData {
    insumos: InsumoRecetaFormData[];
    etapas: NewEtapaReceta[];
}

const plantillaInicial = (): RecetaFormData => ({
    insumos: [],
    etapas: PLANTILLA_ETAPAS.map((etapa) => ({ ...etapa, pasos: etapa.pasos.map((paso) => ({ ...paso })) })),
});

const valoresDeReceta = (receta: Receta): RecetaFormData => ({
    insumos: (receta.insumos ?? []).map((item) => ({ insumo_id: String(item.insumo_id), cantidad: String(item.cantidad) })),
    etapas: receta.etapas.map((etapa) => ({
        nombre: etapa.nombre,
        pasos: etapa.pasos.map((paso) => ({ descripcion: paso.descripcion })),
    })),
});

const insumosValidos = (insumos: InsumoRecetaFormData[] = []): NewInsumoReceta[] => {
    const vistos = new Set<string>();
    return insumos
        .filter((item) => item?.insumo_id && Number(item.cantidad) > 0 && !vistos.has(item.insumo_id) && Boolean(vistos.add(item.insumo_id)))
        .map((item) => ({ insumo_id: Number(item.insumo_id), cantidad: Number(item.cantidad) }));
};

export function RecetaFormModal({ producto, receta, onHide, onSaved }: RecetaFormModalProps) {
    const [cargando, setCargando] = useState(false);
    const esEdicion = Boolean(receta);

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<RecetaFormData>({
        defaultValues: plantillaInicial(),
    });
    const { fields: etapas, append, remove } = useFieldArray({ control, name: "etapas" });
    const etapasActuales = useWatch({ control, name: "etapas" });

    // Cada vez que se abre arranca con la receta a editar o, en el alta, con la plantilla
    useEffect(() => {
        if (producto) reset(receta ? valoresDeReceta(receta) : plantillaInicial());
    }, [producto, receta, reset]);

    const onSubmit = async (data: RecetaFormData) => {
        if (!producto) return;

        setCargando(true);
        try {
            const etapas = data.etapas.map((etapa) => ({
                nombre: etapa.nombre.trim(),
                pasos: etapa.pasos.map((paso) => ({ descripcion: paso.descripcion.trim() })),
            }));
            const insumos = data.insumos.map((item) => ({ insumo_id: Number(item.insumo_id), cantidad: Number(item.cantidad) }));
            const { data: guardada } = receta
                ? await api.put<Receta>(`/recetas/${receta.id}`, { etapas, insumos })
                : await api.post<Receta>("/recetas/", { producto_id: producto.id, etapas, insumos } satisfies NewReceta);
            mostrarAlertaExito(`La receta del producto '${producto.nombre}' se ${esEdicion ? 'actualizó' : 'creó'} correctamente.`);
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
                            ? 'Modificá, eliminá o agregá las etapas y pasos que necesites.'
                            : 'La receta se carga con una plantilla de ejemplo. Eliminá las etapas y pasos que no correspondan y agregá los que necesites.'}
                        {' '}El orden de etapas y pasos es el orden en que aparecen.
                    </p>

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
                        {cargando ? "Guardando..." : "Guardar receta"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
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
    const { fields: insumos, append, remove } = useFieldArray({ control, name: "insumos" });
    const insumosActuales = useWatch({ control, name: "insumos" });
    const { data: insumosDisponibles } = useApi<Insumo[]>(producto ? "/insumos/" : null);
    const [resultado, setResultado] = useState<{ consulta: string; evaluacion: EvaluacionSellos | null } | null>(null);

    const idsDeReceta = new Set((receta?.insumos ?? []).map((item) => item.insumo_id));
    const opciones = (insumosDisponibles ?? [])
        .filter((insumo) => insumo.activo || idsDeReceta.has(insumo.id))
        .map((insumo) => ({
            value: String(insumo.id),
            label: `${insumo.nombre} (${insumo.unidad_medida.nombre})${insumo.valor_energetico === null ? ' · sin información nutricional' : ''}`,
        }));

    const items = insumosValidos(insumosActuales);
    const consulta = JSON.stringify(items);
    const hayItems = items.length > 0;
    const calculando = hayItems && resultado?.consulta !== consulta;
    const evaluacion = hayItems && !calculando ? resultado?.evaluacion ?? null : null;

    useEffect(() => {
        const itemsConsulta: NewInsumoReceta[] = JSON.parse(consulta);
        if (!producto || itemsConsulta.length === 0) return;

        let vigente = true;
        const temporizador = setTimeout(async () => {
            try {
                const { data } = await api.post<EvaluacionSellos>("/recetas/sellos", { producto_id: producto.id, insumos: itemsConsulta });
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
            <h6 className="fw-bold mb-1">Ingredientes por unidad de producto</h6>
            <p className="text-muted small mb-2">
                Indicá la cantidad de cada insumo que se usa para elaborar una unidad de {producto?.nombre}
                {producto && ` (${producto.cantidad_neta} ${producto.unidad_medida.nombre})`}.
            </p>

            {insumos.length === 0 && (
                <p className="text-muted small fst-italic mb-2">Todavía no se agregaron ingredientes.</p>
            )}

            {insumos.map((item, index) => {
                const errorInsumo = errors.insumos?.[index]?.insumo_id;
                const errorCantidad = errors.insumos?.[index]?.cantidad;
                return (
                    <div key={item.id} className="d-flex align-items-start gap-2 mb-2">
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
                            title="Eliminar ingrediente"
                        >
                            <i className="bi bi-x-lg"></i>
                        </Button>
                    </div>
                );
            })}

            <Button variant="link" size="sm" className="px-0 mb-2" onClick={() => append({ insumo_id: "", cantidad: "" })}>
                <i className="bi bi-plus-lg me-1"></i>Agregar ingrediente
            </Button>

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
