import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import { api } from '../../../libs/axios';
import type { SupervisionOcurrencia } from '../types';

interface CompletarSupervisionModalProps {
    ocurrencia: SupervisionOcurrencia | null;
    onHide: () => void;
    onCompleted: () => void;
}

interface CompletarSupervisionFormData {
    observacion: string;
}

export function CompletarSupervisionModal({ ocurrencia, onHide, onCompleted }: CompletarSupervisionModalProps) {
    const esEdicion = ocurrencia?.estado === 'Completada';
    const [cargando, setCargando] = useState(false);

    const { register, handleSubmit, reset } = useForm<CompletarSupervisionFormData>({
        defaultValues: {
            observacion: '',
        },
    });

    useEffect(() => {
        if (ocurrencia) {
            reset({
                observacion: ocurrencia.observacion ? ocurrencia.observacion : '',
            });
        }
    }, [ocurrencia, reset]);

    const handleClose = () => {
        reset();
        onHide();
    };

    const onSubmit = async (data: CompletarSupervisionFormData) => {
        if (!ocurrencia) return;
        setCargando(true);
        try {
            const payload = {
                observacion: data.observacion.trim() ? data.observacion.trim() : null,
            };
            await api.put(`/supervision-lotes/${ocurrencia.id}/completar`, payload);
            mostrarAlertaExito(
                esEdicion
                    ? 'El paso de supervision se edito correctamente.'
                    : 'El paso de supervision se marco como realizado correctamente.'
            );
            onCompleted();
            handleClose();
        } catch (error: any) {
            const detail = error.response?.data?.detail;
            mostrarAlertaError(
                Array.isArray(detail) ? detail[0]?.msg : detail || 'No se pudo completar el paso de supervision.'
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <Modal show={!!ocurrencia} onHide={handleClose} centered>
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {esEdicion ? 'Editar paso supervisado' : 'Confirmar Paso de Supervision'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-start">
                    <p className="mb-1">
                        <strong>Lote:</strong> #{ocurrencia?.lote_produccion_id} - {ocurrencia?.producto_nombre_snap} ({ocurrencia?.cantidad_lote_snap})
                    </p>
                    <p className="mb-1">
                        <strong>Fase:</strong> {ocurrencia?.fase_lote_snap}
                    </p>
                    <p className="mb-1">
                        <strong>Etapa:</strong> {ocurrencia?.etapa_nombre_snap}
                    </p>
                    <p className="mb-2">
                        <strong>Paso:</strong> {ocurrencia?.paso_descripcion_snap}
                    </p>
                    <hr />
                    <Form.Group className="mb-2">
                        <Form.Label className="p-1 fw-bold">Observacion (Opcional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            maxLength={500}
                            placeholder="Ingresa alguna observacion de la supervision..."
                            {...register('observacion')}
                            disabled={cargando}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="justify-content-start">
                    <Button variant="secondary" type="button" onClick={handleClose} disabled={cargando}>
                        Cancelar
                    </Button>
                    <Button variant="success" type="submit" disabled={cargando}>
                        <i className="bi bi-check2-circle me-1"></i>
                        {cargando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Marcar como realizada'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
