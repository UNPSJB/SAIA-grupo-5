import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { deleteInsumoLote } from './InsumoLoteService';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { InsumoLote } from '../types';

interface DeleteInsumoLoteModalProps {
    insumoLote: InsumoLote | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteInsumoLoteModal({ insumoLote, onHide, onDeleted }: DeleteInsumoLoteModalProps) {
    const [cargando, setCargando] = useState(false);

    if (!insumoLote) return null;

    const handleConfirm = async () => {
        setCargando(true);
        try {
            await deleteInsumoLote(insumoLote.id);
            mostrarAlertaExito(`Se quito el insumo '${insumoLote.insumo.nombre}' del lote.`);
            onDeleted();
            onHide();
        } catch (error: any) {
            let mensaje = 'No se pudo quitar el insumo del lote.';
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
        <Modal show={!!insumoLote} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Quitar Insumo del Lote</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estas seguro de que queres quitar el insumo <strong>{insumoLote.insumo.nombre}</strong> (Marca: <em>{insumoLote.marca}</em>, {insumoLote.cantidad} unidades) de esta recepcion?
            </Modal.Body>
            <Modal.Footer className="justify-content-start">
                <Button variant="secondary" onClick={onHide} disabled={cargando}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={handleConfirm} disabled={cargando}>
                    Confirmar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}