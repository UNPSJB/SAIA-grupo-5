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

export function RenovarHabilitacionProveedorModal({ proveedor, onHide, onRenovado }: RenovarHabilitacionProveedorModalProps) {
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
        if (!file) return;

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
                archivo_adjunto: archivoBase64 !== null ? archivoBase64 : proveedor.archivo_adjunto,
            };

            await api.patch(`/proveedores/${proveedor.id}/habilitacion`, payload);

            mostrarAlertaExito(`La habilitacion de '${proveedor.nombre}' fue actualizada correctamente.`);
            onRenovado();
            handleClose();
        } catch (error: any) {
            let mensajeFinal = `No se pudo renovar la habilitacion del proveedor '${proveedor.nombre}'.`;
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.error(error);
        } finally {
            setCargando(false);
        }
    };

    const handleClose = () => {
        reset();
        setArchivoBase64(null);
        setArchivoError(null);
        onHide();
    };

    const archivoAMostrar = archivoBase64 !== null ? archivoBase64 : proveedor?.archivo_adjunto;
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
                            <strong>Habilitacion previa:</strong> {proveedor?.numero_habilitacion} (Vencio/Vence: {vencimientoAnterior.split("-").reverse().join("/")})
                        </p>
                    ) : (
                        <p className="text-warning small mb-0 fst-italic">El proveedor no tiene habilitacion registrada previamente.</p>
                    )}
                    <hr />

                    <div className="row">
                        <div className="col-md-6">
                            <Form.Group className="mb-3 text-start" controlId="formNumeroHabilitacion">
                                <Form.Label className="p-1 fw-bold">Número de Habilitacion *</Form.Label>
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
                                                return `La nueva fecha debe ser posterior a la fecha anterior (${vencimientoAnterior.split("-").reverse().join("/")}).`;
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
                            <div className="mt-3 p-3 border rounded bg-light text-center">
                                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                                    <span className="small text-muted fw-semibold">
                                        {archivoBase64 !== null ? "Archivo seleccionado:" : "Archivo actual guardado:"}
                                    </span>
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm" 
                                        onClick={() => setArchivoBase64("")}
                                        className="d-flex align-items-center gap-1"
                                    >
                                        <i className="bi bi-trash"></i> Quitar
                                    </Button>
                                </div>

                                {esImagen ? (
                                    <div>
                                        <img
                                            src={archivoAMostrar}
                                            alt="Comprobante"
                                            style={{ maxHeight: '180px', borderRadius: '8px', objectFit: 'contain' }}
                                            className="border shadow-sm p-1 bg-white"
                                        />
                                        <div className="small text-muted mt-2 fw-semibold">
                                            {obtenerNombreArchivo(archivoAMostrar)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-2 px-3 border rounded bg-white d-inline-flex align-items-center gap-2 shadow-sm">
                                        <i className="bi bi-file-earmark-pdf-fill text-danger fs-3"></i>
                                        <span className="fw-semibold small">{obtenerNombreArchivo(archivoAMostrar)}</span>
                                        <a
                                            href={archivoAMostrar}
                                            download={obtenerNombreArchivo(archivoAMostrar)}
                                            className="btn btn-outline-success btn-sm ms-2 d-inline-flex align-items-center gap-1"
                                        >
                                            <i className="bi bi-download"></i> Ver / Descargar
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
                            placeholder="Notas sobre el certificado o la renovacion..."
                            {...register("observacion_habilitacion", {
                                maxLength: { value: 500, message: "Maximo 500 caracteres." }
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
                        <i className="bi bi-floppy me-1"></i>Confirmar Habilitación
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}