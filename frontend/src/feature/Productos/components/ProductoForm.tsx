import React, { useState } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import type { UnidadMedida } from '../../UnidadMedida/types';
import type { NewProducto } from '../types';

interface ProductoFormProps {
    textoBoton: string;
    onSubmit: (datos: NewProducto) => void;
    valoresIniciales?: NewProducto;
}

interface ProductoFormData {
    nombre: string;
    descripcion: string;
    cantidad_neta: number | "";
    unidad_medida_id: number | "";
    fecha_lanzamiento: string;
}

export function ProductoForm({ textoBoton, onSubmit, valoresIniciales }: ProductoFormProps) {
    const navigate = useNavigate();
    const { data: unidadesMedida, isLoading } = useApi<UnidadMedida[]>('/unidades-medida/');

    const [fotoBase64, setFotoBase64] = useState<string | null>(null);
    const [fotoError, setFotoError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<ProductoFormData>({
        defaultValues: {
            nombre: valoresIniciales?.nombre || "",
            descripcion: valoresIniciales?.descripcion || "",
            cantidad_neta: valoresIniciales?.cantidad_neta || "",
            unidad_medida_id: valoresIniciales?.unidad_medida_id || "",
            fecha_lanzamiento: valoresIniciales?.fecha_lanzamiento || "",
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFotoError(null);
        const file = e.target.files?.[0];
        if (!file) {
            setFotoBase64(null);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setFotoBase64(reader.result as string);
        };
        reader.onerror = () => {
            setFotoError("Ocurrió un problema al cargar la foto.");
        };
    };

    const onSubmitHookForm = (data: ProductoFormData) => {
        onSubmit({
            nombre: data.nombre.trim(),
            descripcion: data.descripcion.trim() ? data.descripcion.trim() : null,
            cantidad_neta: Number(data.cantidad_neta),
            unidad_medida_id: Number(data.unidad_medida_id),
            fecha_lanzamiento: data.fecha_lanzamiento,
            foto_producto: fotoBase64 ? fotoBase64 : (valoresIniciales?.foto_producto || null),
        });
    };

    return (
        <div className="col-md-6 mx-auto">
            <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
                
                <Form.Group className="mb-3 text-start" controlId="formNombre">
                    <Form.Label className="p-1 fw-bold">Nombre del Producto *</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ingrese el nombre"
                        {...register("nombre", {
                            required: "El nombre del producto es obligatorio.",
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

                <Form.Group className="mb-3 text-start" controlId="formDescripcion">
                    <Form.Label className="p-1 fw-bold">Descripción</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Escribi una descripcion"
                        {...register("descripcion", {
                            minLength: {
                                value: 5,
                                message: "La descripcion debe tener al menos 5 caracteres."
                            },
                            maxLength:{
                                value: 500,
                                message: "La descripcion no puede superar los 500 caracteres."
                            },
                            validate: (value) => {
                                const limpio = value.trim();
                                if (limpio === "") return true;
                                if (limpio.length < 5) return "Si ingresa una descripción, debe tener al menos 5 caracteres.";
                                if (limpio.length > 500) return "La descripción no puede superar los 500 caracteres.";
                                return true;
                            }
                        })}
                        isInvalid={!!errors.descripcion}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.descripcion?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Row>
                        <Col md={6}>
                        <Form.Group className="mb-3 text-start" controlId="formUnidadMedida">
                            <Form.Label className="p-1 fw-bold">Unidad de Medida *</Form.Label>
                            <Form.Select
                                {...register("unidad_medida_id", {
                                    required: "La unidad de medida es obligatoria."
                                })}
                                isInvalid={!!errors.unidad_medida_id}
                            >
                                <option value="" disabled>Seleccione una unidad de medida</option>
                                {isLoading && <option disabled>Cargando unidades de medida...</option>}
                                {unidadesMedida?.filter(u => u.activo).map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.unidad_medida_id?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group className="mb-3 text-start" controlId="formCantidadNeta">
                            <Form.Label className="p-1 fw-bold">Cantidad Neta *</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Ej: 500"
                                {...register("cantidad_neta", {
                                    required: "La cantidad neta es obligatoria.",
                                    min: {
                                        value: 1,
                                        message: "La cantidad neta debe ser mayor a 0 y no permite decimales."
                                    }
                                })}
                                isInvalid={!!errors.cantidad_neta}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.cantidad_neta?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>

                </Row>

                <Form.Group className="mb-3 text-start" controlId="formFechaLanzamiento">
                    <Form.Label className="p-1 fw-bold">Fecha de Lanzamiento *</Form.Label>
                    <Form.Control
                        type="date"
                        {...register("fecha_lanzamiento", {
                            required: "La fecha de lanzamiento es obligatoria."
                        })}
                        isInvalid={!!errors.fecha_lanzamiento}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.fecha_lanzamiento?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formFotoProducto">
                    <Form.Label className="p-1 fw-bold">
                        Foto del Producto
                    </Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        isInvalid={!!fotoError}
                    />
                    <Form.Control.Feedback type="invalid">
                        {fotoError}
                    </Form.Control.Feedback>

                    {(fotoBase64 || valoresIniciales?.foto_producto) && (
                        <div className="mt-3 text-center">
                            <p className="small text-muted mb-1">
                                {fotoBase64 ? "Foto nueva a subir:" : "Foto actual guardada:"}
                            </p>
                            <img
                                src={fotoBase64 || valoresIniciales?.foto_producto || ""}
                                alt="Foto del producto"
                                style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
                                className="border shadow-sm"
                            />
                        </div>
                    )}
                </Form.Group>

                <Button variant="secondary" type="button" onClick={() => navigate('/productos')}>
                    <i className="bi bi-x-circle me-1"></i>Cancelar
                </Button>
                <Button className="ms-2" variant="primary" type="submit">
                    <i className="bi bi-floppy me-1"></i> {textoBoton}
                </Button>
            </Form>
        </div>
    );
}