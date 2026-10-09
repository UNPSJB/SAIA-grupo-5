import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../hooks/useApi";
import type { Equipo } from "../../Equipos/types";

interface PlanCalibracionFormProps {
    textoBoton: string;
    onSubmit: (datos: { equipo_id: number, fecha_inicio: string | null, periodicidad: number }) => void;
    valoresIniciales?: { equipo_id: number, fecha_inicio: string, periodicidad: number };
    editando?: boolean;
}

interface PlanCalibracionFormData {
    equipo_id: number | "";
    fecha_inicio: string;
    periodicidad: number | "";
}

export function PlanCalibracionForm({ textoBoton, onSubmit, valoresIniciales, editando = false }: PlanCalibracionFormProps) {
    const navigate = useNavigate();
    const { data: equipos, isLoading } = useApi<Equipo[]>("/equipos");

    const { register, handleSubmit, formState: { errors } } = useForm<PlanCalibracionFormData>({
        defaultValues: {
            equipo_id: valoresIniciales?.equipo_id || "",
            fecha_inicio: valoresIniciales?.fecha_inicio || "",
            periodicidad: valoresIniciales?.periodicidad || "",
        },
    });

    const onSubmitHookForm = (data: PlanCalibracionFormData) => {
        onSubmit({
            equipo_id: Number(data.equipo_id),
            fecha_inicio: data.fecha_inicio || null,
            periodicidad: Number(data.periodicidad),
        });
    };

    return (
        <div className="col-md-6 mx-auto">
            <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>

                <Form.Group className="mb-3 text-start" controlId="formEquipo">
                    <Form.Label className="p-1 fw-bold">Equipo *</Form.Label>
                    <Form.Select
                        {...register("equipo_id", {
                            required: "El equipo es obligatorio."
                        })}
                        isInvalid={!!errors.equipo_id}
                        disabled={editando}
                    >
                        <option value="" disabled>Seleccione un equipo</option>
                        {isLoading && <option disabled>Cargando equipos...</option>}
                        {equipos?.map((equipo) => (
                            <option key={equipo.id} value={equipo.id}>
                                {equipo.nombre}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        {errors.equipo_id?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formFechaInicio">
                    <Form.Label className="p-1 fw-bold mb-0">Fecha de Inicio</Form.Label>
                    
                    <Form.Text className="text-muted d-block px-1 mb-2">
                        Si se deja vacío, se utilizará la fecha actual.
                    </Form.Text>
                    
                    <Form.Control
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        isInvalid={!!errors.fecha_inicio}
                        disabled={editando}
                    />
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formPeriodicidad">
                    <Form.Label className="p-1 fw-bold">Periodicidad *</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Cantidad de días"
                        {...register("periodicidad", {
                            required: "La periodicidad es obligatoria.",
                            min: {
                                value: 1,
                                message: "La periodicidad debe ser mayor a 0."
                            }
                        })}
                        isInvalid={!!errors.periodicidad}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.periodicidad?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Button variant="secondary" type="button" onClick={() => navigate("/planes-calibracion")}>
                    <i className="bi bi-x-circle me-1"></i>Cancelar
                </Button>

                <Button className="ms-2" variant="primary" type="submit">
                    <i className="bi bi-floppy me-1"></i>{textoBoton}
                </Button>
            </Form>
        </div>
    );
}