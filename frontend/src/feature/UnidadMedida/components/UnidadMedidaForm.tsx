import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

interface UnidadMedidaFormProps {
    textoBoton: string;
    onSubmit: (datos: { nombre: string }) => void;
    valoresIniciales?: { nombre: string };
}


interface UnidadMedidaFormData {
    nombre: string;
}

export function UnidadMedidaForm({ textoBoton, onSubmit, valoresIniciales }: UnidadMedidaFormProps) {
    const navigate = useNavigate();

    const {register, handleSubmit, formState: { errors }, } = useForm<UnidadMedidaFormData> ({
        defaultValues: {
            nombre: valoresIniciales?.nombre || "",
        },
    });

    const onSubmitHookForm = (data: UnidadMedidaFormData) => {
        onSubmit({
            nombre: data.nombre.trim(),
        });
    };

    return (
        <div className="col-md-6 mx-auto">
        <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        
            <Form.Group className="mb-3 text-start" controlId="formNombre">
                <Form.Label className="p-1 fw-bold">Nombre de la Unidad de Medida *</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Ingrese el nombre"
                    {...register("nombre", {
                    required: "El nombre de la unidad de medida es obligatorio.",
                    minLength: {
                        value: 3,
                        message: "El nombre debe tener al menos 3 caracteres."
                    },
                    maxLength: {
                        value: 40,
                        message: "El nombre no puede superar los 40 caracteres."
                    },
                    validate: (value) => value.trim() !== "" || "El nombre no puede ser solo espacios en blanco."
                    })}
                    isInvalid={!!errors.nombre}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.nombre?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Button variant="secondary" type="button" onClick={() => navigate('/unidades-medida')}>
                <i className="bi bi-x-circle me-1"></i>Cancelar
            </Button>
            <Button className="ms-2" variant="primary" type="submit">
                <i className="bi bi-floppy me-1"></i> {textoBoton}
            </Button>
        </Form>
    </div>
    );
}