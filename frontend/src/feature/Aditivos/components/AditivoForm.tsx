import { Button, Form } from 'react-bootstrap';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import { CLASE_AROMATIZANTE, type NewAditivo } from '../types';

interface AditivoFormProps {
    textoBoton: string;
    onSubmit: (datos: NewAditivo) => void;
    valoresIniciales?: NewAditivo;
}

interface AditivoFormData {
    clase_funcional: string;
    nombre: string;
    numero_ins: string;
}

export function AditivoForm({ textoBoton, onSubmit, valoresIniciales }: AditivoFormProps) {
    const navigate = useNavigate();
    const { data: clasesFuncionales, isLoading } = useApi<string[]>('/aditivos/clases-funcionales');

    const { register, handleSubmit, control, formState: { errors } } = useForm<AditivoFormData>({
        defaultValues: {
            clase_funcional: valoresIniciales?.clase_funcional ?? "",
            nombre: valoresIniciales?.nombre ?? "",
            numero_ins: valoresIniciales?.numero_ins ?? "",
        },
    });
    const claseFuncional = useWatch({ control, name: "clase_funcional" });
    const esAromatizante = claseFuncional === CLASE_AROMATIZANTE;

    const onSubmitHookForm = (data: AditivoFormData) => {
        onSubmit({
            clase_funcional: data.clase_funcional,
            nombre: data.nombre.trim(),
            numero_ins: data.numero_ins.trim() || null,
        });
    };

    return (
        <div className="col-md-6 mx-auto">
            <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
                <Form.Group className="mb-3 text-start" controlId="formClaseFuncional">
                    <Form.Label className="p-1 fw-bold">Clase funcional (*)</Form.Label>
                    <Form.Select
                        {...register("clase_funcional", { required: "La clase funcional es obligatoria." })}
                        isInvalid={!!errors.clase_funcional}
                    >
                        <option value="" disabled>Seleccione una clase funcional</option>
                        {isLoading && <option disabled>Cargando clases funcionales...</option>}
                        {clasesFuncionales?.map((clase) => (
                            <option key={clase} value={clase}>{clase}</option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.clase_funcional?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formNombre">
                    <Form.Label className="p-1 fw-bold">Nombre completo (*)</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ej. Sorbato de potasio"
                        {...register("nombre", {
                            required: "El nombre del aditivo es obligatorio.",
                            validate: (valor) => valor.trim().length >= 3 || "El nombre debe tener al menos 3 caracteres.",
                            maxLength: { value: 100, message: "El nombre no puede superar los 100 caracteres." },
                        })}
                        isInvalid={!!errors.nombre}
                    />
                    <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formNumeroIns">
                    <Form.Label className="p-1 fw-bold">Número INS {esAromatizante ? '(opcional)' : '(*)'}</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ej. 202"
                        {...register("numero_ins", {
                            validate: (valor) => esAromatizante || valor.trim() !== "" || "El número INS es obligatorio, salvo para los aromatizantes.",
                            maxLength: { value: 20, message: "El número INS no puede superar los 20 caracteres." },
                        })}
                        isInvalid={!!errors.numero_ins}
                    />
                    <Form.Control.Feedback type="invalid">{errors.numero_ins?.message}</Form.Control.Feedback>
                </Form.Group>

                <Button variant="secondary" type="button" onClick={() => navigate('/aditivos')}>
                    <i className="bi bi-x-circle me-1"></i>Cancelar
                </Button>
                <Button className="ms-2" variant="primary" type="submit">
                    <i className="bi bi-floppy me-1"></i> {textoBoton}
                </Button>
            </Form>
        </div>
    );
}
