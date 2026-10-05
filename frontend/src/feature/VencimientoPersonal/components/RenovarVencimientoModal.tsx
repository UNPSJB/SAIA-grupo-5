import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { api } from '../../../libs/axios';
import type { VencimientoPersonal } from '../types';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';

interface RenovarVencimientoModalProps {
    vencimiento: VencimientoPersonal | null;
    onHide: () => void;
    onRenovado: () => void;
}

interface RenovarVencimientoFormData {
    fecha_desde: string;
    fecha_hasta: string;
    observacion: string;
}

export function RenovarVencimientoModal({ vencimiento, onHide, onRenovado }: RenovarVencimientoModalProps) {
    const [archivoBase64, setArchivoBase64] = useState<string | null>(null);
    const [archivoError, setArchivoError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<RenovarVencimientoFormData>({
        defaultValues: {
            fecha_desde: "",
            fecha_hasta: "",
            observacion: "",
        },
    });

    const fechaDesdeWatch = watch("fecha_desde");       // Se usa para ver que fecha se puso en la fecha desde para comparar y validar que en el fecha hasta no pongas una fecha mas vieja que la desde

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArchivoError(null);
        const file = e.target.files?.[0];
        if (!file) {
            setArchivoBase64(null);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setArchivoBase64(reader.result as string);
        };
        reader.onerror = () => {
            setArchivoError("Ocurrio un problema al cargar el archivo.");
        };
    };

    const onSubmit = async (data: RenovarVencimientoFormData) => {
        if (!vencimiento) return;

        setCargando(true);
        try {
            const datos = {
                fecha_desde: data.fecha_desde,
                fecha_hasta: data.fecha_hasta,
                observacion: data.observacion ? data.observacion.trim() : null,
                archivo_adjunto: archivoBase64,
            };

            await api.post(`/vencimiento-personal/${vencimiento.id}/renovar`, datos);

            mostrarAlertaExito("El vencimiento se renovo correctamente.");
            onRenovado();
        } catch (error: any) {
            let mensajeFinal = `No se pudo renovar el vencimiento '${vencimiento.tipo_vencimiento.nombre}'.`;
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        } finally {
            setCargando(false);
            handleClose();
        }
    };

    const handleClose = () => {
        reset();
        setArchivoBase64(null);
        setArchivoError(null);
        onHide();
    };

    const esImagen = archivoBase64?.startsWith("data:image/");

    return (
        <Modal show={!!vencimiento} onHide={handleClose}>
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Modal.Header closeButton>
                    <Modal.Title>Renovar Vencimiento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1"><strong>Persona:</strong> {vencimiento?.persona.nombre} {vencimiento?.persona.apellido}</p>
                    <p className="mb-1"><strong>Tipo de Vencimiento:</strong> {vencimiento?.tipo_vencimiento.nombre}</p>
                    <hr />

                    <Form.Group className="mb-3 text-start" controlId="formFechaDesde">
                        <Form.Label className="p-1 fw-bold">Nueva Fecha Desde *</Form.Label>
                        <Form.Control
                            type="date"
                            {...register("fecha_desde", { required: "La fecha desde es obligatoria." })}
                            isInvalid={!!errors.fecha_desde}
                        />
                        <Form.Control.Feedback type="invalid">{errors.fecha_desde?.message}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3 text-start" controlId="formFechaHasta">
                        <Form.Label className="p-1 fw-bold">Nueva Fecha Hasta (Vencimiento) *</Form.Label>
                        <Form.Control
                            type="date"
                            {...register("fecha_hasta", {
                                required: "La fecha de vencimiento es obligatoria.",
                                validate: (fecha) => !fechaDesdeWatch || fecha >= fechaDesdeWatch || "La fecha hasta no puede ser menor a la fecha desde.",
                            })}
                            isInvalid={!!errors.fecha_hasta}
                        />
                        <Form.Control.Feedback type="invalid">{errors.fecha_hasta?.message}</Form.Control.Feedback>
                    </Form.Group>

                    <hr />

                    <Form.Group className="mb-3 text-start">
                        <Form.Label className="p-1 fw-bold">Archivo / Comprobante (Opcional)</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={handleFileChange}
                            isInvalid={!!archivoError}
                        />
                        <Form.Control.Feedback type="invalid">{archivoError}</Form.Control.Feedback>
                        {archivoBase64 && (
                            <div className="mt-3 text-center">
                                <p className="small text-muted mb-1">Archivo nuevo a subir:</p>
                                {esImagen ? (
                                    <img
                                        src={archivoBase64}
                                        alt="Comprobante"
                                        style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
                                        className="border shadow-sm"
                                    />
                                ) : (
                                    <div className="p-2 border rounded bg-light d-inline-block">
                                        <i className="bi bi-file-earmark-check text-success me-2"></i>
                                        <span>Documento cargado correctamente</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </Form.Group>

                    <hr />

                    <Form.Group className="mb-3 text-start" controlId="formObservacion">
                        <Form.Label className="p-1 fw-bold">Observación (Opcional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Escribi una observacion..."
                            {...register("observacion", {
                                minLength: {
                                    value: 5,
                                    message: "La observacion debe tener al menos 5 caracteres."
                                },
                                maxLength: {
                                    value: 500,
                                    message: "La observacion no puede superar los 500 caracteres."
                                },
                                validate: (value) => !value || value.trim() !== "" || "La observacion no puede ser solo espacios en blanco.",
                            })}
                            isInvalid={!!errors.observacion}
                        />
                        <Form.Control.Feedback type="invalid">{errors.observacion?.message}</Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={cargando}>
                        <i className="bi bi-x-circle me-1"></i>Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={cargando}>
                        <i className="bi bi-floppy me-1"></i>Confirmar Renovación
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}