import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import type { TipoDocumento } from '../../TiposDocumentos/types';

interface DocumentoFormProps {
    textoBoton: string;
    onSubmit: (datos: { nombre: string, descripcion: string, tipo_id: number }) => void;
    valoresIniciales?: { nombre: string, descripcion: string, tipo_id: number };
}

interface DocumentoFormData { nombre: string; descripcion: string; tipo_id: number | ""; }

export function DocumentoForm({ textoBoton, onSubmit, valoresIniciales }: DocumentoFormProps) {
    const navigate = useNavigate();
    const { data: tipos } = useApi<TipoDocumento[]>('/tipos-documentos/');

    const {register, handleSubmit, formState: { errors }, } = useForm<DocumentoFormData> ({
        defaultValues: {
            nombre: valoresIniciales?.nombre || "",
            descripcion: valoresIniciales?.descripcion || "",
            tipo_id: valoresIniciales?.tipo_id || "",
        },
    });

    const onSubmitHookForm = (data: DocumentoFormData) => {
        onSubmit({
            nombre: data.nombre.trim(),
            descripcion: data.descripcion.trim(),
            tipo_id: Number(data.tipo_id),
        });
    };

    return (
        <div className="col-md-6 mx-auto">
        <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        
            <Form.Group className="mb-3 text-start" controlId="formNombre">
                <Form.Label className="p-1 fw-bold">Nombre del Documento (*)</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Ingrese el nombre"
                    {...register("nombre", {
                    required: "El nombre del documento es obligatorio.",
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

            <Form.Group className="mb-3 text-start" controlId="formDescripcion">
                <Form.Label className="p-1 fw-bold">Descripcion</Form.Label>
                <Form.Control as="textarea" rows={3}
                    placeholder="Escribi una descripcion..."
                    {...register("descripcion",{
                        maxLength: {
                            value: 500,
                            message: "La descripcion no puede superar los 500 caracteres."
                        },
                    })}
                    isInvalid={!!errors.descripcion}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.descripcion?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3 text-start" controlId="formTipo">
                <Form.Label className="p-1 fw-bold">Tipo de Documento (*)</Form.Label>
                <Form.Select
                    {...register("tipo_id", {
                        required: "El tipo de documento es obligatorio."
                    })}
                    isInvalid={!!errors.tipo_id}
                >
                    <option value="">
                        Seleccione un tipo
                    </option>

                    {tipos?.filter((tipo) => tipo.activo).map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                            {tipo.nombre}
                        </option>
                    ))}
                </Form.Select>

                <Form.Control.Feedback type="invalid">
                    {errors.tipo_id?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Button variant="secondary" type="button" onClick={() => navigate('/documentos')}>
                <i className="bi bi-x-circle me-1"></i>Cancelar
            </Button>
            <Button className="ms-2" variant="primary" type="submit">
                <i className="bi bi-floppy me-1"></i> {textoBoton}
            </Button>
        </Form>
    </div>
    );
}
