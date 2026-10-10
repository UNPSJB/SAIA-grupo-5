import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { api } from '../../../libs/axios';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import { getErrorMessage } from '../../../libs/errors';
import type { Incidente, ReabrirIncidente } from '../types';

interface ReabrirIncidenteModalProps {
    incidente: Pick<Incidente, "id" | "nombre"> | null;
    onHide: () => void;
    onReabierto: () => void;
}

interface ReabrirIncidenteFormData {
    motivo: string;
}

export function ReabrirIncidenteModal({ incidente, onHide, onReabierto }: ReabrirIncidenteModalProps) {
    const [guardando, setGuardando] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ReabrirIncidenteFormData>({
        defaultValues: { motivo: '' },
    });

    const handleClose = () => {
        reset();
        onHide();
    };

    const onSubmitHookForm = async (data: ReabrirIncidenteFormData) => {
        if (!incidente) return;

        setGuardando(true);
        try {
            const datos: ReabrirIncidente = { motivo: data.motivo.trim() };
            await api.post(`/incidentes/${incidente.id}/reabrir`, datos);
            mostrarAlertaExito(`Se reabrió el incidente '${incidente.nombre}'.`);
            onReabierto();
            handleClose();
        } catch (error: any) {
            mostrarAlertaError(
                getErrorMessage(error, "No se pudo reabrir el incidente.")
            );
            console.log(error);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal show={incidente !== null} onHide={handleClose}>
            <Form onSubmit={handleSubmit(onSubmitHookForm)} noValidate>
                <Modal.Header closeButton>
                    <Modal.Title>Reabrir incidente</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Incidente: <strong>{incidente?.nombre}</strong>
                    </p>

                    <Form.Group className="mb-3 text-start" controlId="formMotivoReabrir">
                        <Form.Label className="p-1 fw-bold">Motivo de la reapertura (*)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder="Explicá por qué se reabre el incidente..."
                            {...register("motivo", {
                                required: "El motivo de la reapertura es obligatorio.",
                                maxLength: {
                                    value: 500,
                                    message: "El motivo no puede superar los 500 caracteres."
                                },
                                validate: (value) => value.trim() !== "" || "El motivo no puede ser solo espacios en blanco."
                            })}
                            isInvalid={!!errors.motivo}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.motivo?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={guardando}>
                        <i className="bi bi-x-circle me-1"></i>Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={guardando}>
                        <i className="bi bi-arrow-counterclockwise me-1"></i> {guardando ? "Guardando..." : "Reabrir"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
