import { Button, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { api } from "../../../libs/axios";
import type { LoteProduccion, EstadoLote } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface CambiarEstadoLoteModalProps {
    lote: LoteProduccion | null;
    onHide: () => void;
    onChanged: () => void;
}

const SIGUIENTE_ESTADO_MANUAL: Partial<Record<EstadoLote, string>> = {
    "En produccion": "Empaquetando",
    "Empaquetando": "Terminado",
};

export function CambiarEstadoLoteModal({ lote, onHide, onChanged }: CambiarEstadoLoteModalProps) {
    const [cargando, setCargando] = useState(false);
    const [observacion, setObservacion] = useState("");

    useEffect(() => {
        setObservacion("");
    }, [lote]);

    if (!lote) return null;

    const nuevoEstado = SIGUIENTE_ESTADO_MANUAL[lote.estado];
    
    if (!nuevoEstado) return null;

    const handleCambiarEstado = async () => {
        setCargando(true);

        try {
            await api.patch(`/lotes-produccion/${lote.id}/estado`,{
                observacion: observacion.trim() ? observacion.trim() : null});

            mostrarAlertaExito(`El lote de produccion numero ${lote.id} paso al estado '${nuevoEstado}'.`);
            onChanged();
        } catch (error: any) {
            let mensajeFinal = "No se pudo cambiar el estado del lote de produccion numero ${lote.id}.";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
        } finally {
            setCargando(false);
            onHide();
        }
    };

    return (
        <Modal show={lote !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Avanzar estado del lote de produccion numero {lote.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 text-start">
                <p className="mb-2">
                    ¿Desea cambiar el estado del lote de produccion numero <strong>{lote.id}</strong> de{" "}
                    <span className="badge bg-secondary">{lote.estado}</span> a{" "}
                    <span className="badge bg-primary">{nuevoEstado}</span>?
                </p>
                <p className="text-muted small mb-3">
                    El sistema registrara automaticamente tu usuario, la fecha y la hora actual en el historial.
                </p>

                <Form.Group controlId="formObservacionCambioEstado">
                    <Form.Label className="fw-bold">Observaciones / Motivo (opcional)</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Ej: Finalizo la coccion, pasa a empaquetado sin observaciones..."
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                        disabled={cargando}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer className="justify-content-start">
                <Button variant="secondary" onClick={onHide} disabled={cargando}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleCambiarEstado} disabled={cargando}>
                    {cargando ? "Guardando..." : `Pasar a ${nuevoEstado}`}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}