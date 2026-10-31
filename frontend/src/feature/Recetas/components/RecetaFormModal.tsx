import { useEffect, useState } from 'react';
import { Accordion, Badge, Button, Form, Modal } from 'react-bootstrap';
import { useFieldArray, useForm, useWatch, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { isAxiosError } from 'axios';
import { api } from '../../../libs/axios';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { Producto } from '../../Productos/types';
import type { NewEtapaReceta, NewReceta, Receta } from '../types';
import { PLANTILLA_ETAPAS } from '../constants';

interface RecetaFormModalProps {
    producto: Producto | null;
    // Si se pasa una receta el modal la edita; si no, da de alta una nueva desde la plantilla
    receta?: Receta | null;
    onHide: () => void;
    onSaved: (receta: Receta) => void;
}

interface RecetaFormData {
    etapas: NewEtapaReceta[];
}

const plantillaInicial = (): RecetaFormData => ({
    etapas: PLANTILLA_ETAPAS.map((etapa) => ({ ...etapa, pasos: etapa.pasos.map((paso) => ({ ...paso })) })),
});

const valoresDeReceta = (receta: Receta): RecetaFormData => ({
    etapas: receta.etapas.map((etapa) => ({
        nombre: etapa.nombre,
        pasos: etapa.pasos.map((paso) => ({ descripcion: paso.descripcion })),
    })),
});

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
            const { data: guardada } = receta
                ? await api.put<Receta>(`/recetas/${receta.id}`, { etapas })
                : await api.post<Receta>("/recetas/", { producto_id: producto.id, etapas } satisfies NewReceta);
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
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={cargando}>Cancelar</Button>
                    <Button variant="success" type="submit" disabled={cargando}>
                        {cargando ? "Guardando..." : "Guardar receta"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
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
