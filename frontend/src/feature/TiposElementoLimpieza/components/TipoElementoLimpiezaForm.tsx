import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { mutate } from "swr";

import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { getErrorMessage } from "../../../libs/errors";
import type { NewTipoElementoLimpieza } from "../types";

interface TipoElementoLimpiezaFormProps {
    onCreado: (tipoId: number) => void;
    onCancelar?: () => void;
    embebido?: boolean;
}

interface TipoElementoLimpiezaFormData {
    nombre: string;
    prefijo: string;
}

export function TipoElementoLimpiezaForm({
    onCreado,
    onCancelar,
    embebido = false
}: TipoElementoLimpiezaFormProps) {

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TipoElementoLimpiezaFormData>();

    const guardarTipo = async (datos: NewTipoElementoLimpieza) => {
        try {
            const response = await api.post("/elementos-limpieza/tipos", datos);

            await mutate("/elementos-limpieza/tipos");

            mostrarAlertaExito("El tipo de elemento se creó correctamente.");

            onCreado(response.data.id);
        } catch (error: any) {
            mostrarAlertaError(
                getErrorMessage(error, "No se pudo crear el tipo de elemento.")
            );
            console.log(error);
        }
    };

    const onSubmitHookForm = (data: TipoElementoLimpiezaFormData) => {
        guardarTipo({
            nombre: data.nombre.trim(),
            prefijo: data.prefijo.trim().toUpperCase(),
        });
    };

    return (
        <div className={embebido ? "" : "col-md-6 mx-auto"}>
            <div
                className={
                    embebido
                        ? "border rounded p-3 mb-3 bg-light"
                        : "p-4 border rounded bg-white shadow-sm mt-3"
                }
            >
                <Form.Group className="mb-3 text-start" controlId="formNombreTipo">
                    <Form.Label className="p-1 fw-bold">
                        Nombre del Tipo *
                    </Form.Label>

                    <Form.Control
                        type="text"
                        placeholder="Ej: Escoba"
                        {...register("nombre", {
                            required: "El nombre del tipo es obligatorio.",
                            minLength: {
                                value: 3,
                                message: "El nombre debe tener al menos 3 caracteres."
                            },
                            maxLength: {
                                value: 100,
                                message: "El nombre no puede superar los 100 caracteres."
                            },
                            validate: (value) =>
                                value.trim() !== "" ||
                                "El nombre no puede ser solo espacios en blanco."
                        })}
                        isInvalid={!!errors.nombre}
                    />

                    <Form.Control.Feedback type="invalid">
                        {errors.nombre?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formPrefijoTipo">
                    <Form.Label className="p-1 fw-bold">
                        Prefijo *
                    </Form.Label>

                    <Form.Control
                        type="text"
                        placeholder="Ej: ESCO"
                        {...register("prefijo", {
                            required: "El prefijo es obligatorio.",
                            maxLength: {
                                value: 4,
                                message: "El prefijo no puede superar los 4 caracteres."
                            },
                            validate: (value) =>
                                value.trim() !== "" ||
                                "El prefijo no puede ser solo espacios en blanco."
                        })}
                        isInvalid={!!errors.prefijo}
                    />

                    <Form.Control.Feedback type="invalid">
                        {errors.prefijo?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex justify-content-center gap-2">
                    {onCancelar && (
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={onCancelar}
                        >
                            <i className="bi bi-x-circle me-1"></i>
                            Cancelar
                        </Button>
                    )}

                    <Button
                        variant={embebido ? "success" : "primary"}
                        type="button"
                        onClick={handleSubmit(onSubmitHookForm)}
                    >
                        <i className={`bi ${embebido ? "bi-plus-circle" : "bi-floppy"} me-1`}></i>
                        {embebido ? "Crear Tipo" : "Guardar Tipo"}
                    </Button>
                </div>
            </div>
        </div>
    );
}