import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { api } from '../../../libs/axios';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { LoteProveedor } from '../types';

interface AvanzarEtapaLoteModalProps {
    lote: LoteProveedor | null;
    onHide: () => void;
    onAvanzado: () => void;
}

interface AvanzarFormData {
    observaciones: string;
}

export function AvanzarEtapaLoteProveedorModal({ lote, onHide, onAvanzado }: AvanzarEtapaLoteModalProps) {
    const [cargando, setCargando] = useState(false);
    const { register, handleSubmit, reset } = useForm<AvanzarFormData>();

    if (!lote) return null;

    const siguienteEtapa = lote.estado === 'llegada' ? 'Desempaque' : 'Acomodado';

    const onSubmit = async (data: AvanzarFormData) => {
        setCargando(true);
        try {
            await api.patch(`/lotes-proveedor/${lote.id}/avanzar-etapa`, {
                observaciones: data.observaciones?.trim() ? data.observaciones.trim() : null,
            });
            mostrarAlertaExito(`El lote avanzó exitosamente a la etapa de ${siguienteEtapa}.`);
            onAvanzado();
            handleClose();
        } catch (error: any) {
            let mensaje = "No se pudo cambiar la etapa del lote.";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensaje = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensaje);
        } finally {
            setCargando(false);
        }
    };

    const handleClose = () => {
        reset();
        onHide();
    };

    return (
        <Modal show={!!lote} onHide={handleClose}>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Header closeButton>
                    <Modal.Title>Avanzar a {siguienteEtapa}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-2">
                        ¿Confirmás avanzar el lote <strong>{lote.numero_lote}</strong> a la etapa de <strong>{siguienteEtapa}</strong>?
                    </p>
                    <Form.Group className="mt-3">
                        <Form.Label className="fw-semibold">
                            {lote.estado === 'llegada' ? 'Observaciones de Control / Desempaque' : 'Ubicación / Notas de Acomodado'}
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder={
                                lote.estado === 'llegada'
                                    ? 'Ej: Se recibieron los bultos en buen estado. Faltó 1 unidad...'
                                    : 'Ej: Acomodado en estantería B4 depósito central.'
                            }
                            {...register("observaciones")}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={cargando}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={cargando}>
                        <i className="bi bi-arrow-right-circle me-1"></i>Confirmar Avance
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}