import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

interface TipoQuimicoFormProps {
    textoBoton: string;
    onSubmit: (datos: { nombre: string, descripcion: string }) => void;
    valoresIniciales?: { nombre: string, descripcion: string };
}


interface TipoQuimicoFormData {
    nombre: string;
    descripcion: string;
}

export function TipoQuimicoForm({ textoBoton, onSubmit, valoresIniciales }: TipoQuimicoFormProps) {
    const navigate = useNavigate();

    const {register, handleSubmit, formState: { errors }, } = useForm<TipoQuimicoFormData> ({
        defaultValues: {
            nombre: valoresIniciales?.nombre || "",
            descripcion: valoresIniciales?.descripcion || "",
        },
    });

    const onSubmitHookForm = (data: TipoQuimicoFormData) => {
        onSubmit({
            nombre: data.nombre.trim(),
            descripcion: data.descripcion.trim(),
        });
    };

    return (
        <div className="col-md-6 mx-auto">
        <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        
            <Form.Group className="mb-3 text-start" controlId="formNombre">
                <Form.Label className="p-1 fw-bold">Nombre del Tipo de Químico *</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Ingrese el nombre"
                    {...register("nombre", {
                    required: "El nombre del tipo de químico es obligatorio.",
                    minLength: {
                        value: 3,
                        message: "El nombre debe tener al menos 3 caracteres."
                    },
                    maxLength: {
                        value: 30,
                        message: "El nombre no puede superar los 30 caracteres."
                    },
                    validate: (value) => value.trim() !== "" || "El nombre no puede ser solo espacios en blanco."
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
                        maxLength: {
                            value: 400,
                            message: "La descripcion no puede superar los 400 caracteres."
                        },
                        validate: (value) => !value || value.trim() !== "" || "La descripcion no puede ser solo espacios en blanco."
                    })}
                    isInvalid={!!errors.descripcion}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.descripcion?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Button variant="secondary" type="button" onClick={() => navigate('/tipos-quimicos')}>
                <i className="bi bi-x-circle me-1"></i>Cancelar
            </Button>
            <Button className="ms-2" variant="primary" type="submit">
                <i className="bi bi-floppy me-1"></i> {textoBoton}
            </Button>
        </Form>
    </div>
    );
}