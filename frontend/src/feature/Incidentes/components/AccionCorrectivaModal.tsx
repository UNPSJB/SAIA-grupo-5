import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { api } from '../../../libs/axios';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import { getErrorMessage } from '../../../libs/errors';
import type { Incidente, NewAccionCorrectiva } from '../types';

interface AccionCorrectivaModalProps {
    incidente: Pick<Incidente, "id" | "nombre"> | null;
    onHide: () => void;
    onRegistrada: () => void;
}

interface AccionCorrectivaFormData {
    descripcion: string;
}

export function AccionCorrectivaModal({ incidente, onHide, onRegistrada }: AccionCorrectivaModalProps) {
    const [guardando, setGuardando] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<AccionCorrectivaFormData>({
        defaultValues: { descripcion: '' },
    });

    const handleClose = () => {
        reset();
        onHide();
    };

    const onSubmitHookForm = async (data: AccionCorrectivaFormData) => {
        if (!incidente) return;

        setGuardando(true);
        try {
            const datos: NewAccionCorrectiva = {
                incidente_id: incidente.id,
                descripcion: data.descripcion.trim(),
            };
            await api.post('/acciones-correctivas/', datos);
            mostrarAlertaExito(`Se registró la acción correctiva del incidente '${incidente.nombre}' y se cerró el incidente.`);
            onRegistrada();
            handleClose();
        } catch (error: any) {
            mostrarAlertaError(
                getErrorMessage(error, "No se pudo registrar la acción correctiva.")
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
                    <Modal.Title>Registrar acción correctiva</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Incidente: <strong>{incidente?.nombre}</strong>
                    </p>

                    <Form.Group className="mb-3 text-start" controlId="formDescripcionAccionCorrectiva">
                        <Form.Label className="p-1 fw-bold">Descripción de la acción correctiva (*)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder="Describí la acción correctiva realizada..."
                            {...register("descripcion", {
                                required: "La descripción de la acción correctiva es obligatoria.",
                                maxLength: {
                                    value: 500,
                                    message: "La descripción no puede superar los 500 caracteres."
                                },
                                validate: (value) => value.trim() !== "" || "La descripción no puede ser solo espacios en blanco."
                            })}
                            isInvalid={!!errors.descripcion}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.descripcion?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Text className="text-muted">
                        Al registrar la acción correctiva, el incidente se marca como cerrado.
                    </Form.Text>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={guardando}>
                        <i className="bi bi-x-circle me-1"></i>Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={guardando}>
                        <i className="bi bi-floppy me-1"></i> {guardando ? "Guardando..." : "Registrar"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
