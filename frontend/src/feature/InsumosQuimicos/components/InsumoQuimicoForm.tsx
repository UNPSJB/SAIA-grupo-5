import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { UnidadMedida } from '../../Insumos/types';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import type { TipoQuimico } from '../../TiposQuimicos/types';

interface InsumoQuimicoFormProps {
    textoBoton: string;
    onSubmit: (datos: { nombre: string; unidad_medida: UnidadMedida, tipo_quimico_id: number }) => void;
    valoresIniciales?: { nombre: string; unidad_medida: UnidadMedida, tipo_quimico_id: number };
}


interface InsumoQuimicoFormData {
    nombre: string;
    unidad_medida: UnidadMedida | "";
    tipo_quimico_id: number | "";
}

export function InsumoQuimicoForm({ textoBoton, onSubmit, valoresIniciales }: InsumoQuimicoFormProps) {
    const navigate = useNavigate();
    const { data: tiposQuimicos, isLoading } = useApi<TipoQuimico[]>('/tipos-quimicos/');

    const {register, handleSubmit, formState: { errors }, } = useForm<InsumoQuimicoFormData> ({
        defaultValues: {
            nombre: valoresIniciales?.nombre || "",
            unidad_medida: valoresIniciales?.unidad_medida || "",
            tipo_quimico_id: valoresIniciales?.tipo_quimico_id || "",
        },
    });

    const onSubmitHookForm = (data: InsumoQuimicoFormData) => {
        onSubmit({
            nombre: data.nombre.trim(),
            unidad_medida: data.unidad_medida as UnidadMedida,
            tipo_quimico_id: Number(data.tipo_quimico_id),
        });
    };

    return (
        <div className="col-md-6 mx-auto">
        <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        
            <Form.Group className="mb-3 text-start" controlId="formNombre">
                <Form.Label className="p-1 fw-bold">Nombre del Insumo</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Ingrese el nombre"
                    {...register("nombre", {
                    required: "El nombre del insumo es obligatorio.",
                    validate: (value) => value.trim() !== "" || "El nombre no puede ser solo espacios en blanco."
                    })}
                    isInvalid={!!errors.nombre}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.nombre?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3 text-start" controlId="formUnidadMedida">
                <Form.Label className="p-1 fw-bold">Unidad de medida</Form.Label>
                <Form.Select
                    {...register("unidad_medida", {
                    required: "La unidad de medida es obligatoria."
                    })}
                    isInvalid={!!errors.unidad_medida}
                >
                    <option value="" disabled>Seleccione una unidad de medida</option>
                    {Object.entries(UnidadMedida).map(([clave, valor]) => (
                        <option key={clave} value={valor}>
                            {valor}
                        </option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                    {errors.unidad_medida?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3 text-start" controlId="formTipoQuimicoID">
                <Form.Label className="p-1 fw-bold">Tipo de Quimico</Form.Label>
                <Form.Select
                    {...register("tipo_quimico_id", {
                    required: "El tipo de quimico es obligatorio."
                    })}
                    isInvalid={!!errors.tipo_quimico_id}
                >
                    <option value="" disabled> Seleccione un tipo de quimico</option>
                    {isLoading && <option disabled> Cargando tipos de quimicos...</option>}
                    {tiposQuimicos?.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                            {tipo.nombre}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Button variant="secondary" type="button" onClick={() => navigate('/insumos-quimicos')}>
                <i className="bi bi-x-circle me-1"></i>Cancelar
            </Button>
            <Button className="ms-2" variant="primary" type="submit">
                <i className="bi bi-floppy me-1"></i> {textoBoton}
            </Button>
        </Form>
    </div>
    );
}