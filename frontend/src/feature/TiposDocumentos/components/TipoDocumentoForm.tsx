import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

interface TipoDocumentoFormProps {
    textoBoton: string;
    onSubmit: (datos: { nombre: string, descripcion: string }) => void;
    valoresIniciales?: { nombre: string, descripcion: string };
}

interface TipoDocumentoFormData { nombre: string; descripcion: string; }

export function TipoDocumentoForm({ textoBoton, onSubmit, valoresIniciales }: TipoDocumentoFormProps) {
    const navigate = useNavigate();

    const {register, handleSubmit, formState: { errors }, } = useForm<TipoDocumentoFormData> ({
        defaultValues: {
            nombre: valoresIniciales?.nombre || "",
            descripcion: valoresIniciales?.descripcion || "",
        },
    });

    const onSubmitHookForm = (data: TipoDocumentoFormData) => {
        onSubmit({
            nombre: data.nombre.trim(),
            descripcion: data.descripcion.trim(),
        });
    };

    return (
        <div className="col-md-6 mx-auto">
        <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        
            <Form.Group className="mb-3 text-start" controlId="formNombre">
                <Form.Label className="p-1 fw-bold">Nombre del Tipo (*)</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Ingrese el nombre"
                    {...register("nombre", {
                    required: "El nombre del tipo de documento es obligatorio.",
                    maxLength: {
                        value: 60,
                        message: "El nombre no puede superar los 60 caracteres."
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
                            value: 100,
                            message: "La descripcion no puede superar los 100 caracteres."
                        },
                    })}
                    isInvalid={!!errors.descripcion}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.descripcion?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Button variant="secondary" type="button" onClick={() => navigate('/tipos-documentos')}>
                <i className="bi bi-x-circle me-1"></i>Cancelar
            </Button>
            <Button className="ms-2" variant="primary" type="submit">
                <i className="bi bi-floppy me-1"></i> {textoBoton}
            </Button>
        </Form>
    </div>
    );
}