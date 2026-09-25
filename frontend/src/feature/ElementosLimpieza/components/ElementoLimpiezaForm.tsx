import { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../hooks/useApi";
import { TipoElementoLimpiezaForm } from "../../TiposElementoLimpieza/components/TipoElementoLimpiezaForm";
import type { TipoElementoLimpieza } from "../../TiposElementoLimpieza/types";

interface ElementoLimpiezaFormProps {
    textoBoton: string;
    onSubmit: (datos: { nombre: string, tipo_id: number, material: string | null, ubicacion: string | null, frecuencia_recambio: number | null }) => void;
    valoresIniciales?: { nombre: string, tipo_id: number, material: string | null, ubicacion: string | null, frecuencia_recambio: number | null };
}

interface ElementoLimpiezaFormData {
    nombre: string;
    tipo_id: number | "";
    material: string;
    ubicacion: string;
    frecuencia_recambio: number | "";
}

export function ElementoLimpiezaForm({ textoBoton, onSubmit, valoresIniciales }: ElementoLimpiezaFormProps) {
    const navigate = useNavigate();
    const [crearTipo, setCrearTipo] = useState(false);
    const { data: tipos, isLoading } = useApi<TipoElementoLimpieza[]>("/elementos-limpieza/tipos");

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<ElementoLimpiezaFormData>({
        defaultValues: {
            nombre: valoresIniciales?.nombre || "",
            tipo_id: valoresIniciales?.tipo_id || "",
            material: valoresIniciales?.material || "",
            ubicacion: valoresIniciales?.ubicacion || "",
            frecuencia_recambio: valoresIniciales?.frecuencia_recambio || "",
        },
    });

    const onSubmitHookForm = (data: ElementoLimpiezaFormData) => {
        onSubmit({
            nombre: data.nombre.trim(),
            tipo_id: Number(data.tipo_id),
            material: data.material.trim() || null,
            ubicacion: data.ubicacion.trim() || null,
            frecuencia_recambio: data.frecuencia_recambio ? Number(data.frecuencia_recambio) : null,
        });
    };

    return (
        <div className="col-md-6 mx-auto">
            <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>

                <Form.Group className="mb-3 text-start" controlId="formNombre">
                    <Form.Label className="p-1 fw-bold">Nombre del Elemento</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ingrese el nombre"
                        {...register("nombre", {
                            required: "El nombre del elemento es obligatorio.",
                            minLength: {
                                value: 3,
                                message: "El nombre debe tener al menos 3 caracteres."
                            },
                            maxLength: {
                                value: 100,
                                message: "El nombre no puede superar los 100 caracteres."
                            },
                            validate: (value) => value.trim() !== "" || "El nombre no puede ser solo espacios en blanco."
                        })}
                        isInvalid={!!errors.nombre}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.nombre?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formTipo">
                    <Form.Label className="p-1 fw-bold">Tipo de Elemento</Form.Label>
                    <InputGroup>
                        <Form.Select
                            {...register("tipo_id", {
                                required: "El tipo de elemento es obligatorio."
                            })}
                            isInvalid={!!errors.tipo_id}
                        >
                            <option value="" disabled>Seleccione un tipo de elemento</option>
                            {isLoading && <option disabled>Cargando tipos...</option>}
                            {tipos?.filter(tipo => tipo.estado).map((tipo) => (
                                <option key={tipo.id} value={tipo.id}>
                                    {tipo.nombre}
                                </option>
                            ))}
                        </Form.Select>

                        <Button
                            variant="outline-primary"
                            type="button"
                            onClick={() => setCrearTipo(!crearTipo)}
                        >
                            <i className="bi bi-plus-lg"></i>
                        </Button>
                    </InputGroup>
                    <Form.Control.Feedback type="invalid">
                        {errors.tipo_id?.message}
                    </Form.Control.Feedback>
                </Form.Group>
                
                {crearTipo && (
                    <TipoElementoLimpiezaForm
                        onCreado={(tipoId) => {
                            setValue("tipo_id", tipoId);
                            setCrearTipo(false);
                        }}
                    />
                )}

                <Form.Group className="mb-3 text-start" controlId="formMaterial">
                    <Form.Label className="p-1 fw-bold">Material</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ingrese el material"
                        {...register("material")}
                    />
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formUbicacion">
                    <Form.Label className="p-1 fw-bold">Ubicación</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ingrese la ubicación"
                        {...register("ubicacion")}
                    />
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formFrecuenciaRecambio">
                    <Form.Label className="p-1 fw-bold">Frecuencia de Recambio</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Cantidad de días"
                        {...register("frecuencia_recambio")}
                    />
                </Form.Group>

                <Button variant="secondary" type="button" onClick={() => navigate("/elementos-limpieza")}>
                    <i className="bi bi-x-circle me-1"></i>Cancelar
                </Button>

                <Button className="ms-2" variant="primary" type="submit">
                    <i className="bi bi-floppy me-1"></i>{textoBoton}
                </Button>
            </Form>
        </div>
    );
}