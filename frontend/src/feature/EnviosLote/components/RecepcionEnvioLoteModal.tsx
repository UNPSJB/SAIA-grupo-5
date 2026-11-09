import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { api } from '../../../libs/axios';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { EnvioLote, EnvioLoteUpdate } from '../types';

interface RecepcionEnvioModalProps {
    envio: EnvioLote | null;
    onHide: () => void;
    onRecepcionado: () => void;
}

interface RecepcionEnvioFormData {
    recibido: string;
    fecha_entrega: string;
    observaciones: string;
}

export function RecepcionEnvioModal({ envio, onHide, onRecepcionado }: RecepcionEnvioModalProps) {
    const hoy = new Date().toISOString().split("T")[0];
    const [cargando, setCargando] = useState(false);

    const {register, handleSubmit, watch, formState: { errors }, reset} = useForm<RecepcionEnvioFormData>({
        defaultValues: {
            recibido: "true",
            fecha_entrega: "",
            observaciones: "",
        },
    });

    const recibidoWatch = watch("recibido") === "true";

    const handleClose = () => {
        reset();
        onHide();
    };

    const onSubmit = async (data: RecepcionEnvioFormData) => {
        if (!envio) return;

        setCargando(true);
        try {
            const datos: EnvioLoteUpdate = {
                recibido: data.recibido === "true",
                fecha_entrega: data.fecha_entrega,
                observaciones: data.observaciones ? data.observaciones.trim() : null,
            };

            await api.patch(`/envios-lote/${envio.id}/recepcion`, datos);

            mostrarAlertaExito(
                datos.recibido
                    ? "La entrega del envio se registro correctamente."
                    : "El envio fue marcado como rechazado y el stock se reintegro al lote."
            );
            onRecepcionado();
        } catch (error: any) {
            let mensajeFinal = `No se pudo registrar la recepción del envio #${envio.numero_remito}.`;
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

    return (
        <Modal show={!!envio} onHide={handleClose} backdrop="static">
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Modal.Header closeButton>
                    <Modal.Title>Recepción de Envío - Remito {envio?.numero_remito}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1"><strong>Cliente:</strong> {envio?.cliente.razon_social}</p>
                    <p className="mb-1"><strong>Cantidad enviada:</strong> {envio?.cantidad} unidades</p>
                    <p className="mb-1"><strong>Transportista:</strong> {envio?.transportista}</p>
                    <p className="mb-1"><strong>Fecha de despacho:</strong> {envio?.fecha_envio.split("-").reverse().join("/")}</p>
                    <hr />

                    <Form.Group className="mb-3 text-start">
                        <Form.Label className="p-1 fw-bold">Resultado de la Entrega *</Form.Label>
                        <div className="d-flex gap-4">
                            <Form.Check
                                type="radio"
                                id="recibido-si"
                                label="Entregado conforme"
                                value="true"
                                {...register("recibido")}
                            />
                            <Form.Check
                                type="radio"
                                id="recibido-no"
                                label="Rechazado (reintegra stock)"
                                value="false"
                                {...register("recibido")}
                            />
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3 text-start" controlId="formFechaEntrega">
                        <Form.Label className="p-1 fw-bold">Fecha de Recepción / Rechazo *</Form.Label>
                        <Form.Control
                            type="date"
                            min={envio?.fecha_envio}
                            {...register("fecha_entrega", {
                                required: "La fecha de entrega o rechazo es obligatoria.",
                                validate: (f) => {
                                    if (envio?.fecha_envio && f < envio.fecha_envio) {
                                        return "La fecha no puede ser anterior a la de envío.";
                                    }
                                    return true;
                                }
                            })}
                            isInvalid={!!errors.fecha_entrega}
                        />
                        <Form.Control.Feedback type="invalid">{errors.fecha_entrega?.message}</Form.Control.Feedback>
                    </Form.Group>

                    <hr />

                    <Form.Group className="mb-3 text-start" controlId="formObservaciones">
                        <Form.Label className="p-1 fw-bold">Observaciones</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder={!recibidoWatch ? "Indica el motivo del rechazo del lote..." : "Escribi una observacion..."}
                            {...register("observaciones", {
                                maxLength: { value: 500, message: "No puede superar los 500 caracteres." },
                                validate: (v) => !v || v.trim() !== "" || "La observacion no puede ser solo espacios en blanco.",
                            })}
                            isInvalid={!!errors.observaciones}
                        />
                        <Form.Control.Feedback type="invalid">{errors.observaciones?.message}</Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="justify-content-start">
                    <Button variant="secondary" onClick={handleClose} disabled={cargando}>
                        <i className="bi bi-x-circle me-1"></i>Cancelar
                    </Button>
                    <Button variant={recibidoWatch ? "primary" : "danger"} type="submit" disabled={cargando}>
                        <i className={`bi ${recibidoWatch ? "bi-check-circle" : "bi-arrow-counterclockwise"} me-1`}></i>
                        {recibidoWatch ? "Confirmar Entrega" : "Confirmar Rechazo"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}