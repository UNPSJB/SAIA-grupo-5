import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { api } from '../../../libs/axios';
import type { PlanCalibracion } from '../types';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';


interface RealizarCalibracionModalProps {
    plan: PlanCalibracion | null;
    onHide: () => void;
    onRealizado: () => void;
}

interface RealizarCalibracionFormData {
    fecha: string;
    observacion: string;
}


const obtenerNombreArchivo = (base64: string | null | undefined): string => {
    if (!base64) return "";

    const matchNombre = base64.match(/;name=([^;]+);base64,/);

    if (matchNombre?.[1]) {
        return decodeURIComponent(matchNombre[1]);
    }

    if (base64.startsWith("data:application/pdf")) return "Certificado PDF";
    if (base64.startsWith("data:image/")) return "Imagen adjunta";

    return "Certificado adjunto";
};


export function RealizarCalibracionModal({ plan, onHide, onRealizado }: RealizarCalibracionModalProps) {
    const [certificadoBase64, setCertificadoBase64] = useState<string | null>(null);
    const [archivoError, setArchivoError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<RealizarCalibracionFormData>({
        defaultValues: {
            fecha: "",
            observacion: ""
        }
    });


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArchivoError(null);

        const file = e.target.files?.[0];

        if (!file) {
            setCertificadoBase64(null);
            return;
        }

        const tiposPermitidos = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

        if (!tiposPermitidos.includes(file.type)) {
            setArchivoError("Solo se permiten archivos PDF o imagen.");
            setCertificadoBase64(null);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            const resultado = reader.result as string;
            const conNombre = resultado.replace(";base64,", `;name=${encodeURIComponent(file.name)};base64,`);
            setCertificadoBase64(conNombre);
        };

        reader.onerror = () => {
            setArchivoError("Ocurrió un problema al cargar el archivo.");
        };
    };


    const onSubmit = async (data: RealizarCalibracionFormData) => {
        if (!plan) return;

        setCargando(true);

        try {
            const datos = {
                fecha: data.fecha,
                observacion: data.observacion ? data.observacion.trim() : null,
                certificado: certificadoBase64
            };

            await api.post(`/registros-calibracion/plan/${plan.id}`, datos);

            mostrarAlertaExito("La calibración se registró correctamente.");
            onRealizado();
            handleClose();

        } catch (error: any) {
            let mensajeFinal = "No se pudo registrar la calibración.";

            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }

            mostrarAlertaError(mensajeFinal);
            console.log(error);

        } finally {
            setCargando(false);
        }
    };


    const handleClose = () => {
        reset();
        setCertificadoBase64(null);
        setArchivoError(null);
        onHide();
    };


    const esImagen = certificadoBase64?.startsWith("data:image/");


    return (
        <Modal show={!!plan} onHide={handleClose} centered>
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Modal.Header closeButton>
                    <Modal.Title>Registrar Calibración</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form.Group className="mb-3 text-start" controlId="formFecha">
                        <Form.Label className="p-1 fw-bold">Fecha de Realización *</Form.Label>
                        <Form.Control type="date" max={new Date().toISOString().split("T")[0]} {...register("fecha", { required: "La fecha de realización es obligatoria." })} isInvalid={!!errors.fecha} />
                        <Form.Control.Feedback type="invalid">{errors.fecha?.message}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3 text-start">
                        <Form.Label className="p-1 fw-bold">Certificado</Form.Label>
                        <Form.Control type="file" accept=".pdf,image/*" onChange={handleFileChange} isInvalid={!!archivoError} />
                        <Form.Control.Feedback type="invalid">{archivoError}</Form.Control.Feedback>

                        {certificadoBase64 && (
                            <div className="mt-3 text-center">
                                <p className="small text-muted mb-1">Archivo seleccionado:</p>

                                {esImagen ? (
                                    <div>
                                        <img src={certificadoBase64} alt="Certificado" style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }} className="border shadow-sm" />
                                        <div className="small text-muted">{obtenerNombreArchivo(certificadoBase64)}</div>
                                    </div>
                                ) : (
                                    <div className="p-2 px-3 border rounded bg-light d-inline-flex align-items-center gap-2">
                                        <i className="bi bi-file-earmark-text text-success fs-5"></i>
                                        <span className="fw-semibold">{obtenerNombreArchivo(certificadoBase64)}</span>
                                        <a href={certificadoBase64} download={obtenerNombreArchivo(certificadoBase64)} className="btn btn-outline-primary btn-sm ms-2">
                                            <i className="bi bi-download me-1"></i>Ver
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3 text-start" controlId="formObservacion">
                        <Form.Label className="p-1 fw-bold">Observación (Opcional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Escribí una observación..."
                            {...register("observacion", {
                                maxLength: {
                                    value: 255,
                                    message: "La observación no puede superar los 255 caracteres."
                                },
                                validate: (value) => !value || value.trim() !== "" || "La observación no puede ser solo espacios en blanco."
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
                        <i className="bi bi-floppy me-1"></i>Registrar Calibración
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}