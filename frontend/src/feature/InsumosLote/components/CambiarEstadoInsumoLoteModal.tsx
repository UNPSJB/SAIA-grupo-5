import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { cambiarEstadoInsumoLote } from './InsumoLoteService';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { InsumoLote } from '../types';

interface Props {
    insumoLote: InsumoLote | null;
    onHide: () => void;
    onActualizado: () => void;
}

export function CambiarEstadoInsumoLoteModal({ insumoLote, onHide, onActualizado }: Props) {
    const [cargando, setCargando] = useState(false);

    if (!insumoLote) return null;

    const estaActivo = insumoLote.activo;
    const titulo = estaActivo ? 'Dar de Baja Insumo' : 'Reactivar Insumo';
    const accionTexto = estaActivo ? 'dar de baja' : 'reactivar';

    const handleConfirm = async () => {
        setCargando(true);
        try {
            await cambiarEstadoInsumoLote(insumoLote.id);
            mostrarAlertaExito(
                estaActivo
                    ? `Se dio de baja el insumo '${insumoLote.insumo.nombre}'.`
                    : `Se reactivó el insumo '${insumoLote.insumo.nombre}'.`
            );
            onActualizado();
            onHide();
        } catch (error: any) {
            let mensaje = `No se pudo ${accionTexto} el insumo.`;
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
                <Modal.Title>{titulo}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {estaActivo ? (
                    <>
                        ¿Estas seguro de que queres dar de baja el insumo{' '}
                        <strong>{insumoLote.insumo.nombre}</strong> (Marca: <em>{insumoLote.marca}</em>)?
                        <br />
                        <small className="text-muted">
                            Permanecera en el historial pero no se podrá utilizar en producción. Podes reactivarlo más adelante si quedan unidades.
                        </small>
                    </>
                ) : (
                    <>
                        ¿Confirmas la reactivación del insumo <strong>{insumoLote.insumo.nombre}</strong>?
                        <br />
                        <small className="text-success">
                            Volvera a estar disponible para su uso en planta ({insumoLote.cantidad_restante} unidades disponibles).
                        </small>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer className="justify-content-start">
                <Button variant="secondary" onClick={onHide} disabled={cargando}>
                    Cancelar
                </Button>
                <Button
                    variant={estaActivo ? 'danger' : 'success'}
                    onClick={handleConfirm}
                    disabled={cargando}
                >
                    {estaActivo ? 'Confirmar Baja' : 'Reactivar'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}