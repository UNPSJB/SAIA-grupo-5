import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

interface TipoVencimientoFormProps {
    textoBoton: string;
    onSubmit: (datos: { nombre: string, descripcion: string | null }) => void;
    valoresIniciales?: { nombre: string, descripcion: string | null };
}


interface TipoVencimientoFormData {
    nombre: string;
    descripcion: string;
}

export function TipoVencimientoForm({ textoBoton, onSubmit, valoresIniciales }: TipoVencimientoFormProps) {
    const navigate = useNavigate();

    const {register, handleSubmit, formState: { errors }, } = useForm<TipoVencimientoFormData> ({
        defaultValues: {
            nombre: valoresIniciales?.nombre || "",
            descripcion: valoresIniciales?.descripcion || "",
        },
    });

    const onSubmitHookForm = (data: TipoVencimientoFormData) => {
        onSubmit({
            nombre: data.nombre.trim(),
            descripcion: data.descripcion ? data.descripcion.trim() : null,
        });
    };

    return (
        <div className="col-md-6 mx-auto">
        <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        
            <Form.Group className="mb-3 text-start" controlId="formNombre">
                <Form.Label className="p-1 fw-bold">Nombre del Tipo de Vencimiento *</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Ingrese el nombre"
                    {...register("nombre", {
                    required: "El nombre del tipo de vencimiento es obligatorio.",
                    minLength: {
                        value: 3,
                        message: "El nombre debe tener al menos 3 caracteres."
                    },
                    maxLength: {
                        value: 40,
                        message: "El nombre no puede superar los 40 caracteres."
                    },
                    validate: (value) => {
                        if (value.trim() === "") return "El nombre no puede ser solo espacios en blanco.";
                        if (value.trim().length < 3) return "El nombre debe tener al menos 3 caracteres."
                        return true;
                    }
                    })}
                    isInvalid={!!errors.nombre}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.nombre?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3 text-start" controlId="formDescripcion">
                <Form.Label className="p-1 fw-bold">Descripcion</Form.Label>
                <Form.Control as="textarea" rows={3}
                    placeholder="Escribi una descripcion..."
                    {...register("descripcion",{
                        minLength: {
                            value: 5,
                            message: "La descripcion debe tener al menos 5 caracteres."
                        },
                        maxLength: {
                            value: 500,
                            message: "La descripcion no puede superar los 500 caracteres."
                        },
                        validate: (value) => {
                            if (!value) return true;
                            if (value.trim() === "") return "La descripcion no puede ser solo espacios en blanco.";
                            if (value.trim().length < 5) return "La descripcion debe tener al menos 5 caracteres."
                        }
                    })}
                    isInvalid={!!errors.descripcion}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.descripcion?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Button variant="secondary" type="button" onClick={() => navigate('/tipos-vencimientos')}>
                <i className="bi bi-x-circle me-1"></i>Cancelar
            </Button>
            <Button className="ms-2" variant="primary" type="submit">
                <i className="bi bi-floppy me-1"></i> {textoBoton}
            </Button>
        </Form>
    </div>
    );
}