import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { NewFuenteNutricional } from '../types';

interface FuenteNutricionalFormProps {
    textoBoton: string;
    onSubmit: (datos: NewFuenteNutricional) => void;
    valoresIniciales?: NewFuenteNutricional;
}

interface FuenteNutricionalFormData {
    nombre: string;
    descripcion: string;
    origen: string;
    licencia_uso: string;
    formato_uso: string;
    licencia_verificada: boolean;
}

export function FuenteNutricionalForm({ textoBoton, onSubmit, valoresIniciales }: FuenteNutricionalFormProps) {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<FuenteNutricionalFormData>({
        defaultValues: {
            nombre: valoresIniciales?.nombre || "",
            descripcion: valoresIniciales?.descripcion || "",
            origen: valoresIniciales?.origen || "",
            licencia_uso: valoresIniciales?.licencia_uso || "",
            formato_uso: valoresIniciales?.formato_uso || "",
            licencia_verificada: valoresIniciales?.licencia_verificada ?? false,
        },
    });

    const onSubmitHookForm = (data: FuenteNutricionalFormData) => {
        onSubmit({
            nombre: data.nombre.trim(),
            descripcion: data.descripcion?.trim() ? data.descripcion.trim() : null,
            origen: data.origen?.trim() ? data.origen.trim() : null,
            licencia_uso: data.licencia_uso.trim(),
            formato_uso: data.formato_uso.trim(),
            licencia_verificada: data.licencia_verificada,
        });
    };

    return (
        <div className="col-md-7 mx-auto">
            <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
                <Form.Group className="mb-3 text-start" controlId="formNombre">
                    <Form.Label className="p-1 fw-bold">Nombre (*)</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ej: SARA 2, Rotulo Proveedor, Valor Propio..."
                        {...register("nombre", {
                            required: "El nombre es obligatorio.",
                            minLength: { value: 3, message: "El nombre debe tener al menos 3 caracteres." },
                            maxLength: { value: 60, message: "El nombre no puede superar los 60 caracteres." },
                            validate: (value) => value.trim().length >= 3 || "El nombre debe tener al menos 3 caracteres válidos.",
                        })}
                        isInvalid={!!errors.nombre}
                    />
                    <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formOrigen">
                    <Form.Label className="p-1 fw-bold">Origen </Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ej: Ministerio de Salud de la Nación"
                        {...register("origen", {
                            maxLength: { value: 500, message: "Maximo 500 caracteres." },
                            validate: (val) => !val.trim() || val.trim().length >= 5 || "Si ingresa un origen debe tener al menos 5 caracteres.",
                        })}
                        isInvalid={!!errors.origen}
                    />
                    <Form.Control.Feedback type="invalid">{errors.origen?.message}</Form.Control.Feedback>
                </Form.Group>

                <div className="row">
                    <div className="col-md-6">
                        <Form.Group className="mb-3 text-start" controlId="formLicenciaUso">
                            <Form.Label className="p-1 fw-bold">Licencia de Uso (*)</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: Dominio público"
                                {...register("licencia_uso", {
                                    required: "La licencia de uso es obligatoria.",
                                    minLength: { value: 5, message: "Debe tener al menos 5 caracteres." },
                                    maxLength: { value: 500, message: "Maximo 500 caracteres." },
                                    validate: (val) => val.trim().length >= 5 || "Debe tener al menos 5 caracteres válidos.",
                                })}
                                isInvalid={!!errors.licencia_uso}
                            />
                            <Form.Control.Feedback type="invalid">{errors.licencia_uso?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </div>

                    <div className="col-md-6">
                        <Form.Group className="mb-3 text-start" controlId="formFormatoUso">
                            <Form.Label className="p-1 fw-bold">Formato de Uso (*)</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: Archivo CSV"
                                {...register("formato_uso", {
                                    required: "El formato de uso es obligatorio.",
                                    minLength: { value: 5, message: "Debe tener al menos 5 caracteres." },
                                    maxLength: { value: 500, message: "Maximo 500 caracteres." },
                                    validate: (val) => val.trim().length >= 5 || "Debe tener al menos 5 caracteres válidos.",
                                })}
                                isInvalid={!!errors.formato_uso}
                            />
                            <Form.Control.Feedback type="invalid">{errors.formato_uso?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </div>
                </div>

                <Form.Group className="mb-3 text-start" controlId="formDescripcion">
                    <Form.Label className="p-1 fw-bold">Descripción</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Observaciones de la tabla nutricional..."
                        {...register("descripcion", {
                            maxLength: { value: 500, message: "Maximo 500 caracteres." },
                            validate: (val) => !val.trim() || val.trim().length >= 5 || "Si ingresa una descripción debe tener al menos 5 caracteres.",
                        })}
                        isInvalid={!!errors.descripcion}
                    />
                    <Form.Control.Feedback type="invalid">{errors.descripcion?.message}</Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex justify-content-start gap-2 mt-3">
                    <Button variant="secondary" type="button" onClick={() => navigate('/fuentes-nutricionales')}>
                        <i className="bi bi-x-circle me-1"></i>Cancelar
                    </Button>
                    <Button variant="primary" type="submit">
                        <i className="bi bi-floppy me-1"></i> {textoBoton}
                    </Button>
                </div>
            </Form>
        </div>
    );
}