import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { NewAlergeno } from '../types';
import { AppSwitch } from '../../../components/AppSwitch';

interface AlergenoFormProps {
    textoBoton: string;
    onSubmit: (datos: NewAlergeno) => void;
    valoresIniciales?: NewAlergeno;
}

interface AlergenoFormData {
    nombre: string;
    descripcion: string;
    es_tacc: boolean;
}

export function AlergenoForm({ textoBoton, onSubmit, valoresIniciales }: AlergenoFormProps) {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<AlergenoFormData>({
        defaultValues: {
            nombre: valoresIniciales?.nombre || "",
            descripcion: valoresIniciales?.descripcion || "",
            es_tacc: valoresIniciales?.es_tacc ?? false,
        },
    });

    const onSubmitHookForm = (data: AlergenoFormData) => {
        onSubmit({
            nombre: data.nombre.trim(),
            descripcion: data.descripcion?.trim() ? data.descripcion.trim() : null,
            es_tacc: data.es_tacc,
        });
    };

    return (
        <div className="col-md-7 mx-auto">
            <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
                <Form.Group className="mb-3 text-start" controlId="formNombreAlergeno">
                    <Form.Label className="p-1 fw-bold">Nombre (*)</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ej: Trigo, Leche, Soja, Maní..."
                        {...register("nombre", {
                            required: "El nombre es obligatorio.",
                            minLength: { value: 2, message: "El nombre debe tener al menos 2 caracteres." },
                            maxLength: { value: 100, message: "El nombre no puede superar los 100 caracteres." },
                            validate: (value) => value.trim().length >= 2 || "El nombre debe tener al menos 2 caracteres válidos.",
                        })}
                        isInvalid={!!errors.nombre}
                    />
                    <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formDescripcionAlergeno">
                    <Form.Label className="p-1 fw-bold">Descripción</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Detalle o derivados incluidos..."
                        {...register("descripcion", {
                            maxLength: { value: 500, message: "Máximo 500 caracteres." },
                            validate: (val) => !val.trim() || val.trim().length >= 5 || "Si ingresa una descripción debe tener al menos 5 caracteres.",
                        })}
                        isInvalid={!!errors.descripcion}
                    />
                    <Form.Control.Feedback type="invalid">{errors.descripcion?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formEsTacc">
                    <AppSwitch
                        label="Contiene gluten (TACC: Trigo, Avena, Cebada o Centeno)"
                        {...register("es_tacc")}
                    />
                    <Form.Text className="text-muted">
                        Si se marca, todo insumo asociado a este alérgeno quedará marcado con gluten.
                    </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-start gap-2 mt-3">
                    <Button variant="secondary" type="button" onClick={() => navigate('/alergenos')}>
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