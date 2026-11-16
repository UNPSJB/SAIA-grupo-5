import { Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import type { Producto } from '../../Productos/types';
import type { NewLoteProduccion } from '../types';

interface LoteProduccionFormProps {
    textoBoton: string;
    onSubmit: (datos: NewLoteProduccion) => void;
    valoresIniciales?: NewLoteProduccion;
}

interface LoteProduccionFormData {
    producto_id: number | "";
    fecha_produccion: string;
    fecha_vencimiento: string;
    cantidad_producida: number | "";
}

export function LoteProduccionForm({ textoBoton, onSubmit, valoresIniciales }: LoteProduccionFormProps) {
    const navigate = useNavigate();
    const { data: productos, isLoading } = useApi<Producto[]>('/productos/');

    const { register, handleSubmit, watch, formState: { errors } } = useForm<LoteProduccionFormData>({
        defaultValues: {
            producto_id: valoresIniciales?.producto_id || "",
            fecha_produccion: valoresIniciales?.fecha_produccion || "",
            fecha_vencimiento: valoresIniciales?.fecha_vencimiento || "",
            cantidad_producida: valoresIniciales?.cantidad_producida || "",
        },
    });

    const hoy = new Date().toISOString().split("T")[0];

    const fechaProduccion = watch("fecha_produccion");

    const onSubmitHookForm = (data: LoteProduccionFormData) => {
        onSubmit({
            producto_id: Number(data.producto_id),
            fecha_produccion: data.fecha_produccion,
            fecha_vencimiento: data.fecha_vencimiento,
            cantidad_producida: Number(data.cantidad_producida),
        });
    };

    return (
        <div className="col-md-6 mx-auto">
            <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
                
                <Form.Group className="mb-3 text-start" controlId="formProducto">
                    <Form.Label className="p-1 fw-bold">Producto *</Form.Label>
                    <Form.Select
                        {...register("producto_id", {
                            required: "El producto es obligatorio."
                        })}
                        isInvalid={!!errors.producto_id}
                    >
                        <option value="" disabled>Seleccione un Producto</option>
                        {isLoading && <option disabled>Cargando productos...</option>}
                        {productos?.filter(p => p.activo).map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.nombre}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        {errors.producto_id?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3 text-start" controlId="formFechaProduccion">
                            <Form.Label className="p-1 fw-bold">Fecha de Produccion *</Form.Label>
                            <Form.Control
                                type="date"
                                max={(hoy) || undefined}
                                {...register("fecha_produccion", {
                                    required: "La fecha de produccion es obligatoria.",
                                    validate: (f) => {
                                        if (f > hoy) {
                                            return "La fecha de produccion no puede ser posterior a hoy."
                                        }
                                        return true;
                                    }
                                })}
                                isInvalid={!!errors.fecha_produccion}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.fecha_produccion?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group className="mb-3 text-start" controlId="formFechaVencimiento">
                            <Form.Label className="p-1 fw-bold">Fecha de Vencimiento *</Form.Label>
                            <Form.Control
                                type="date"
                                disabled={!fechaProduccion}
                                min={fechaProduccion || undefined}
                                {...register("fecha_vencimiento", {
                                    required: "La fecha de vencimiento es obligatoria.",
                                    validate: (value) => {
                                        if (!fechaProduccion) return true;
                                        return value > fechaProduccion || "La fecha de vencimiento debe ser posterior a la de produccion.";
                                    }
                                })}
                                isInvalid={!!errors.fecha_vencimiento}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.fecha_vencimiento?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3 text-start" controlId="formCantidadProducida">
                            <Form.Label className="p-1 fw-bold">Cantidad producida *</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Ej: 100"
                                {...register("cantidad_producida", {
                                    required: "La cantidad producida es obligatoria.",
                                    min: {
                                        value: 1,
                                        message: "La cantidad producida debe ser mayor a 0 y no permite decimales."
                                    }
                                })}
                                isInvalid={!!errors.cantidad_producida}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.cantidad_producida?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                <Button variant="secondary" type="button" onClick={() => navigate('/lotes-produccion')}>
                    <i className="bi bi-x-circle me-1"></i>Cancelar
                </Button>
                <Button className="ms-2" variant="primary" type="submit">
                    <i className="bi bi-floppy me-1"></i> {textoBoton}
                </Button>
            </Form>
        </div>
    );
}