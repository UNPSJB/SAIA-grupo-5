import { useState } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import type { Equipo } from '../../Equipos/types';
import type { Producto } from '../../Productos/types';
import type { Sector } from '../../Sectores/types';
import type { NewLoteProduccion } from '../types';

interface LoteProduccionFormProps {
    textoBoton: string;
    onSubmit: (datos: NewLoteProduccion) => void;
    valoresIniciales?: NewLoteProduccion;
    mostrarAlmacenamiento?: boolean;
}

interface LoteProduccionFormData {
    producto_id: number | "";
    fecha_produccion: string;
    fecha_vencimiento: string;
    cantidad_producida: number | "";
}

export function LoteProduccionForm({ textoBoton, onSubmit, valoresIniciales, mostrarAlmacenamiento = false }: LoteProduccionFormProps) {
    const navigate = useNavigate();
    const { data: productos, isLoading } = useApi<Producto[]>('/productos/');
    const { data: equipos } = useApi<Equipo[]>(mostrarAlmacenamiento ? '/equipos/' : null);
    const { data: sectores } = useApi<Sector[]>(mostrarAlmacenamiento ? '/sectores/' : null);

    const [tipoUbicacion, setTipoUbicacion] = useState<'ninguno' | 'equipo' | 'sector'>(
        valoresIniciales?.equipo_id ? 'equipo' : valoresIniciales?.sector_id ? 'sector' : 'ninguno'
    );
    const [equipoId, setEquipoId] = useState<string>(valoresIniciales?.equipo_id ? String(valoresIniciales.equipo_id) : '');
    const [sectorId, setSectorId] = useState<string>(valoresIniciales?.sector_id ? String(valoresIniciales.sector_id) : '');

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
        const payload: NewLoteProduccion = {
            producto_id: Number(data.producto_id),
            fecha_produccion: data.fecha_produccion,
            fecha_vencimiento: data.fecha_vencimiento,
            cantidad_producida: Number(data.cantidad_producida),
        };
        if (mostrarAlmacenamiento) {
            payload.equipo_id = tipoUbicacion === 'equipo' && equipoId ? Number(equipoId) : null;
            payload.sector_id = tipoUbicacion === 'sector' && sectorId ? Number(sectorId) : null;
        }
        onSubmit(payload);
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

                {mostrarAlmacenamiento && (
                    <div className="p-3 border rounded bg-light-subtle mb-3 text-start">
                        <Form.Label className="fw-bold small mb-2">
                            Ubicacion de almacenamiento
                        </Form.Label>
                        <div className="d-flex flex-wrap gap-3 mb-2 small">
                            <Form.Check
                                type="radio"
                                id="form-lote-ubic-ninguno"
                                label="Sin ubicacion asignada"
                                checked={tipoUbicacion === 'ninguno'}
                                onChange={() => {
                                    setTipoUbicacion('ninguno');
                                    setEquipoId('');
                                    setSectorId('');
                                }}
                            />
                            <Form.Check
                                type="radio"
                                id="form-lote-ubic-sector"
                                label="Sector / Deposito"
                                checked={tipoUbicacion === 'sector'}
                                onChange={() => {
                                    setTipoUbicacion('sector');
                                    setEquipoId('');
                                }}
                            />
                            <Form.Check
                                type="radio"
                                id="form-lote-ubic-equipo"
                                label="Equipo / Camara"
                                checked={tipoUbicacion === 'equipo'}
                                onChange={() => {
                                    setTipoUbicacion('equipo');
                                    setSectorId('');
                                }}
                            />
                        </div>

                        {tipoUbicacion === 'sector' && (
                            <Form.Select
                                size="sm"
                                value={sectorId}
                                onChange={(e) => setSectorId(e.target.value)}
                            >
                                <option value="">Selecciona un sector...</option>
                                {(sectores ?? []).filter((s) => s.activo).map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        )}

                        {tipoUbicacion === 'equipo' && (
                            <Form.Select
                                size="sm"
                                value={equipoId}
                                onChange={(e) => setEquipoId(e.target.value)}
                            >
                                <option value="">Selecciona un equipo / camara...</option>
                                {(equipos ?? []).filter((eq) => eq.estado).map((eq) => (
                                    <option key={eq.id} value={eq.id}>
                                        {eq.nombre} ({eq.sector?.nombre || 'Sin sector'})
                                        {eq.controla_temperatura
                                            ? ` [${eq.temperatura_minima} C a ${eq.temperatura_maxima} C]`
                                            : ''}
                                    </option>
                                ))}
                            </Form.Select>
                        )}
                    </div>
                )}

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