import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { api } from '../../../libs/axios';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { LoteProveedor } from '../types';

interface DeleteLoteProveedorModalProps {
    lote: LoteProveedor | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteLoteProveedorModal({ lote, onHide, onDeleted }: DeleteLoteProveedorModalProps) {
    const [cargando, setCargando] = useState(false);

    if (!lote) return null;

    const accion = lote.activo ? 'dar de baja' : 'dar de alta';

    const handleConfirm = async () => {
        setCargando(true);
        try {
            await api.patch(`/lotes-proveedor/${lote.id}/estado`);
            mostrarAlertaExito(`El lote '${lote.numero_lote}' fue actualizado correctamente.`);
            onDeleted();
            onHide();
        } catch (error: any) {
            let mensaje = `No se pudo ${accion} el lote.`;
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensaje = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensaje);
        } finally {
            setCargando(false);
        }
    };

    return (
        <Modal show={!!lote} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{lote.activo ? 'Dar de baja Lote' : 'Dar de alta Lote'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estas seguro de que queres {accion} el lote <strong>{lote.numero_lote}</strong> del proveedor{' '}
                <strong>{lote.proveedor?.nombre}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={cargando}>
                    Cancelar
                </Button>
                <Button variant={lote.activo ? 'danger' : 'success'} onClick={handleConfirm} disabled={cargando}>
                    Confirmar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}