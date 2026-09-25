import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../hooks/useApi";
import type { ElementoLimpieza } from "../../ElementosLimpieza/types";
import type { NewRecambioElementoLimpieza } from "../types";

interface RecambioElementoLimpiezaFormProps {
    elementoId?: number;
    onSubmit: (elementoId: number, datos: NewRecambioElementoLimpieza) => void;
}

interface RecambioElementoLimpiezaFormData {
    elemento_id: number | "";
    fecha: string;
    observacion: string;
}

export function RecambioElementoLimpiezaForm({ elementoId, onSubmit }: RecambioElementoLimpiezaFormProps) {
    const navigate = useNavigate();
    const { data: elementos } = useApi<ElementoLimpieza[]>("/elementos-limpieza");

    const { register, handleSubmit, formState: { errors } } = useForm<RecambioElementoLimpiezaFormData>({
        defaultValues: {
            elemento_id: elementoId || "",
            fecha: "",
            observacion: "",
        }
    });

    const onSubmitHookForm = (data: RecambioElementoLimpiezaFormData) => {
        onSubmit(Number(data.elemento_id), {
            fecha: data.fecha || null,
            observacion: data.observacion.trim() || null,
        });
    };

    return (
        <div className="col-md-6 mx-auto">
            <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>

                <Form.Group className="mb-3 text-start" controlId="formElemento">
                    <Form.Label className="p-1 fw-bold">Elemento de Limpieza</Form.Label>

                    {elementoId ? (
                        <Form.Control
                            value={
                                elementos?.find(elemento => elemento.id === elementoId)?.nombre
                                ?? "Cargando..."
                            }
                            disabled
                        />
                    ) : (
                        <Form.Select
                            {...register("elemento_id", {
                                required: "El elemento es obligatorio."
                            })}
                            isInvalid={!!errors.elemento_id}
                        >
                            <option value="" disabled>Seleccione un elemento</option>

                            {elementos
                                ?.filter(elemento => elemento.estado)
                                .map(elemento => (
                                    <option key={elemento.id} value={elemento.id}>
                                        {elemento.codigo} - {elemento.nombre}
                                    </option>
                                ))}
                        </Form.Select>
                    )}

                    <Form.Control.Feedback type="invalid">
                        {errors.elemento_id?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formFecha">
                    <Form.Label className="p-1 fw-bold">Fecha del Recambio</Form.Label>
                    <Form.Control
                        type="date"
                        {...register("fecha")}
                    />
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formObservacion">
                    <Form.Label className="p-1 fw-bold">Observación</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Ingrese una observación"
                        {...register("observacion", {
                            maxLength: {
                                value: 255,
                                message: "La observación no puede superar los 255 caracteres."
                            }
                        })}
                        isInvalid={!!errors.observacion}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.observacion?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Button
                    variant="secondary"
                    type="button"
                    onClick={() => navigate("/recambios-elementos-limpieza")}
                >
                    <i className="bi bi-x-circle me-1"></i>Cancelar
                </Button>

                <Button className="ms-2" variant="primary" type="submit">
                    <i className="bi bi-floppy me-1"></i>Registrar Recambio
                </Button>
            </Form>
        </div>
    );
}