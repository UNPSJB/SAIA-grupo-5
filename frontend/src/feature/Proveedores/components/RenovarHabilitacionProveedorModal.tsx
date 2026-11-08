import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { api } from '../../../libs/axios';
import type { Proveedor, RenovarHabilitacionProveedor } from '../types';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';

interface RenovarHabilitacionProveedorModalProps {
    proveedor: Proveedor | null;
    onHide: () => void;
    onRenovado: () => void;
}

interface RenovarHabilitacionFormData {
    numero_habilitacion: string;
    vencimiento_habilitacion: string;
    observacion_habilitacion: string;
}

const obtenerNombreArchivo = (base64: string | null | undefined): string => {
    if (!base64) return "";
    const matchNombre = base64.match(/;name=([^;]+);base64,/);
    if (matchNombre?.[1]) {
        return decodeURIComponent(matchNombre[1]);
    }
    if (base64.startsWith("data:application/pdf")) return "Habilitacion_Sanitaria.pdf";
    if (base64.startsWith("data:image/")) return "Imagen de comprobante";
    return "Documento adjunto";
};

export function RenovarHabilitacionProveedorModal({proveedor, onHide, onRenovado,}: RenovarHabilitacionProveedorModalProps) {
    const [archivoBase64, setArchivoBase64] = useState<string | null>(null);
    const [archivoError, setArchivoError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<RenovarHabilitacionFormData>({
        defaultValues: {
            numero_habilitacion: "",
            vencimiento_habilitacion: "",
            observacion_habilitacion: "",
        },
    });

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
            const resultado = reader.result as string;
            const conNombre = resultado.replace(";base64,", `;name=${encodeURIComponent(file.name)};base64,`);
            setArchivoBase64(conNombre);
        };
        reader.onerror = () => {
            setArchivoError("Ocurrió un problema al cargar el archivo.");
        };
    };

    const onSubmit = async (data: RenovarHabilitacionFormData) => {
        if (!proveedor) return;

        setCargando(true);
        try {
            const payload: RenovarHabilitacionProveedor = {
                numero_habilitacion: data.numero_habilitacion.trim(),
                vencimiento_habilitacion: data.vencimiento_habilitacion,
                observacion_habilitacion: data.observacion_habilitacion.trim() ? data.observacion_habilitacion.trim() : null,
                archivo_adjunto: archivoBase64,
            };

            await api.patch(`/proveedores/${proveedor.id}/habilitacion`, payload);

            mostrarAlertaExito(`La habilitacion de '${proveedor.nombre}' fue actualizada correctamente.`);
            onRenovado();
        } catch (error: any) {
            let mensajeFinal = `No se pudo renovar la habilitacion del proveedor '${proveedor.nombre}'.`;
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

    const archivoAMostrar = archivoBase64 || proveedor?.archivo_adjunto;
    const esImagen = archivoAMostrar?.startsWith("data:image/");
    const vencimientoAnterior = proveedor?.vencimiento_habilitacion || null;

    return (
        <Modal show={!!proveedor} onHide={handleClose} size="lg">
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {proveedor?.numero_habilitacion ? "Renovar Habilitacion Sanitaria" : "Cargar Habilitacion Sanitaria"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1"><strong>Proveedor:</strong> {proveedor?.nombre}</p>
                    <p className="mb-1"><strong>CUIT:</strong> {proveedor?.cuit}</p>
                    {vencimientoAnterior ? (
                        <p className="text-muted small mb-0">
                            <strong>Habilitacion previa:</strong> {proveedor?.numero_habilitacion} (Vencio/Vence: {vencimientoAnterior})
                        </p>
                    ) : (
                        <p className="text-warning small mb-0 fst-italic">El proveedor no tiene habilitacion registrada previamente.</p>
                    )}
                    <hr />

                    <div className="row">
                        <div className="col-md-6">
                            <Form.Group className="mb-3 text-start" controlId="formNumeroHabilitacion">
                                <Form.Label className="p-1 fw-bold">Numero de Habilitacion *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ej: HAB-2026-9988"
                                    {...register("numero_habilitacion", {
                                        required: "El numero de habilitacion es obligatorio.",
                                        maxLength: { value: 100, message: "Maximo 100 caracteres." },
                                        validate: (val) => val.trim() !== "" || "No puede ser solo espacios en blanco."
                                    })}
                                    isInvalid={!!errors.numero_habilitacion}
                                />
                                <Form.Control.Feedback type="invalid">{errors.numero_habilitacion?.message}</Form.Control.Feedback>
                            </Form.Group>
                        </div>

                        <div className="col-md-6">
                            <Form.Group className="mb-3 text-start" controlId="formVencimientoHabilitacion">
                                <Form.Label className="p-1 fw-bold">Nueva Fecha de Vencimiento *</Form.Label>
                                <Form.Control
                                    type="date"
                                    min={vencimientoAnterior || undefined}
                                    {...register("vencimiento_habilitacion", {
                                        required: "La fecha de vencimiento es obligatoria.",
                                        validate: (fecha) => {
                                            if (vencimientoAnterior && fecha <= vencimientoAnterior) {
                                                return `La nueva fecha debe ser posterior a la fecha anterior (${vencimientoAnterior}).`;
                                            }
                                            return true;
                                        }
                                    })}
                                    isInvalid={!!errors.vencimiento_habilitacion}
                                />
                                <Form.Control.Feedback type="invalid">{errors.vencimiento_habilitacion?.message}</Form.Control.Feedback>
                            </Form.Group>
                        </div>
                    </div>

                    <hr />

                    <Form.Group className="mb-3 text-start">
                        <Form.Label className="p-1 fw-bold">Comprobante / Certificado (PDF o Imagen)</Form.Label>
                        <Form.Control
                            type="file"
                            accept="application/pdf,image/*"
                            onChange={handleFileChange}
                            isInvalid={!!archivoError}
                        />
                        <Form.Control.Feedback type="invalid">{archivoError}</Form.Control.Feedback>

                        {archivoAMostrar && (
                            <div className="mt-3 text-center">
                                <p className="small text-muted mb-1">
                                    {archivoBase64 ? "Archivo nuevo a subir:" : "Archivo actual guardado:"}
                                </p>
                                {esImagen ? (
                                    <div>
                                        <img
                                            src={archivoAMostrar}
                                            alt="Comprobante"
                                            style={{ maxHeight: '160px', borderRadius: '8px', objectFit: 'contain' }}
                                            className="border shadow-sm p-1"
                                        />
                                        <div className="small text-muted mt-1">{obtenerNombreArchivo(archivoAMostrar)}</div>
                                    </div>
                                ) : (
                                    <div className="p-2 px-3 border rounded bg-light d-inline-flex align-items-center gap-2">
                                        <i className="bi bi-file-earmark-pdf-fill text-danger fs-4"></i>
                                        <span className="fw-semibold">{obtenerNombreArchivo(archivoAMostrar)}</span>
                                        <a
                                            href={archivoAMostrar}
                                            download={obtenerNombreArchivo(archivoAMostrar)}
                                            className="btn btn-outline-primary btn-sm ms-2"
                                        >
                                            <i className="bi bi-download me-1"></i>Ver / Descargar
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-2 text-start" controlId="formObservacion">
                        <Form.Label className="p-1 fw-bold">Observacion</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Notas sobre el certificado o la renovación..."
                            {...register("observacion_habilitacion", {
                                maxLength: { value: 500, message: "Máximo 500 caracteres." }
                            })}
                            isInvalid={!!errors.observacion_habilitacion}
                        />
                        <Form.Control.Feedback type="invalid">{errors.observacion_habilitacion?.message}</Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="justify-content-start">
                    <Button variant="secondary" onClick={handleClose} disabled={cargando}>
                        <i className="bi bi-x-circle me-1"></i>Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={cargando}>
                        <i className="bi bi-floppy me-1"></i>Confirmar Habilitacion
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}