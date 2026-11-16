import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { NewProveedor } from '../types';

interface ProveedorFormProps {
    textoBoton: string;
    onSubmit: (datos: NewProveedor) => void;
    valoresIniciales?: NewProveedor;
}

interface ProveedorFormData {
    nombre: string;
    cuit: string;
    telefono: string;
    email: string;
}

export function ProveedorForm({ textoBoton, onSubmit, valoresIniciales }: ProveedorFormProps) {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<ProveedorFormData>({
        defaultValues: {
            nombre: valoresIniciales?.nombre || "",
            cuit: valoresIniciales?.cuit || "",
            telefono: valoresIniciales?.telefono || "",
            email: valoresIniciales?.email || "",
        },
    });

    const onSubmitHookForm = (data: ProveedorFormData) => {
        onSubmit({
            nombre: data.nombre.trim(),
            cuit: data.cuit.trim(),
            telefono: data.telefono?.trim() ? data.telefono.trim() : null,
            email: data.email?.trim() ? data.email.trim() : null,
        });
    };

    return (
        <div className="col-md-7 mx-auto">
            <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
                <Form.Group className="mb-3 text-start" controlId="formNombre">
                    <Form.Label className="p-1 fw-bold">Razon Social / Nombre *</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ingrese la razon social o nombre"
                        {...register("nombre", {
                            required: "El nombre es obligatorio.",
                            minLength: { value: 2, message: "El nombre debe tener al menos 2 caracteres." },
                            maxLength: { value: 150, message: "El nombre no puede superar los 150 caracteres." },
                            validate: (value) => value.trim() !== "" || "El nombre no puede ser solo espacios.",
                        })}
                        isInvalid={!!errors.nombre}
                    />
                    <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formCuit">
                    <Form.Label className="p-1 fw-bold">CUIT *</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ej: 30-11223344-5 o 30112233445"
                        {...register("cuit", {
                            required: "El CUIT es obligatorio.",
                            maxLength: {
                                value: 20,
                                message: "El CUIT no puede superar los 20 caracteres."
                            },
                            validate: (value) => {
                                if (value.trim() === "") return "El CUIT no puede estar vacío.";
                                return true;
                            }
                        })}
                        isInvalid={!!errors.cuit}
                    />
                    <Form.Control.Feedback type="invalid">{errors.cuit?.message}</Form.Control.Feedback>
                </Form.Group>

                <div className="row">
                    <div className="col-md-6">
                        <Form.Group className="mb-3 text-start" controlId="formTelefono">
                            <Form.Label className="p-1 fw-bold">Telefono</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: 2804123456"
                                {...register("telefono", {
                                    maxLength: { value: 40, message: "Maximo 40 caracteres." }
                                })}
                                isInvalid={!!errors.telefono}
                            />
                            <Form.Control.Feedback type="invalid">{errors.telefono?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </div>

                    <div className="col-md-6">
                        <Form.Group className="mb-3 text-start" controlId="formEmail">
                            <Form.Label className="p-1 fw-bold">Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="proveedor@empresa.com"
                                {...register("email", {
                                    maxLength: { value: 254, message: "Maximo 254 caracteres." },
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Formato de email invalido."
                                    }
                                })}
                                isInvalid={!!errors.email}
                            />
                            <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </div>
                </div>

                <div className="d-flex justify-content-start gap-2 mt-3">
                    <Button variant="secondary" type="button" onClick={() => navigate('/proveedores')}>
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