import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { api } from '../../../libs/axios';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { LoteProveedor } from '../types';

interface AvanzarEtapaModalProps {
    lote: LoteProveedor | null;
    onHide: () => void;
    onAvanzado: () => void;
}

interface FormData {
    observacion: string;
}

export function AvanzarEtapaLoteProveedorModal({ lote, onHide, onAvanzado }: AvanzarEtapaModalProps) {
    const [cargando, setCargando] = useState(false);
    const { register, handleSubmit, reset } = useForm<FormData>();

    if (!lote) return null;

    const estaEnLlegada = lote.estado === 'llegada';
    const siguienteEtapa = estaEnLlegada ? 'Desempaque' : 'Acomodado';

    const onSubmit = async (data: FormData) => {
        setCargando(true);
        try {
            await api.patch(`/lotes-proveedor/${lote.id}/avanzar-etapa`, {
                observacion: data.observacion?.trim() ? data.observacion.trim() : null,
            });
            mostrarAlertaExito(`El lote avanzo a ${siguienteEtapa}.`);
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
                    <Modal.Title>{estaEnLlegada ? "Iniciar Desempaque" : "Acomodar en Deposito"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-2">
                        ¿Confirmás avanzar el lote <strong>{lote.numero_lote}</strong> a la etapa de <strong>{siguienteEtapa}</strong>?
                    </p>
                    <Form.Group className="mt-3">
                        <Form.Label className="fw-semibold">
                            {estaEnLlegada ? "Observaciones de Descarga (Opcional)" : "Observaciones de Control / Inspeccion"}
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder={estaEnLlegada ? "Notas sobre la descarga..." : "Detalle de control de insumos..."}
                            {...register("observacion")}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={cargando}>
                        Cancelar
                    </Button>
                    <Button variant="success" type="submit" disabled={cargando}>
                        <i className="bi bi-arrow-right-circle me-1"></i>Confirmar Avance
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}