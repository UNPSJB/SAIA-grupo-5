import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { FuenteNutricional } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface VerificarFuenteNutricionalModalProps {
    fuente: FuenteNutricional | null;
    onHide: () => void;
    onVerificada: () => void;
}

export function VerificarFuenteNutricionalModal({ fuente, onHide, onVerificada }: VerificarFuenteNutricionalModalProps) {
    const handleVerificar = async () => {
        if (!fuente) return;

        const estabaVerificada = fuente.licencia_verificada;

        try {
            await api.patch<FuenteNutricional>(`/fuentes-nutricionales/${fuente.id}/verificada`);
            mostrarAlertaExito(
                estabaVerificada
                    ? `Se quitó la verificación de licencia a '${fuente.nombre}'.`
                    : `La licencia de '${fuente.nombre}' fue verificada correctamente.`
            );
            onVerificada();
        } catch (error: any) {
            let mensajeFinal = `No se pudo actualizar la verificación de '${fuente.nombre}'.`;
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        } finally {
            onHide();
        }
    };

    const estaVerificada = fuente?.licencia_verificada ?? false;

    return (
        <Modal show={fuente !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaVerificada ? 'Quitar verificación de licencia' : 'Verificar licencia de uso'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-2">
                    <strong>Fuente:</strong> {fuente?.nombre}
                </p>
                <p className="mb-3">
                    <strong>Licencia declarada:</strong> {fuente?.licencia_uso}
                </p>
                <p className="mb-0">
                    {estaVerificada
                        ? "¿Deseas revocar la verificación de esta fuente? No se podrán importar nuevos CSV hasta volver a verificarla."
                        : "¿Confirmás que la licencia de uso es válida y habilitás esta fuente para importar alimentos?"}
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant={estaVerificada ? "warning" : "success"} onClick={handleVerificar}>
                    {estaVerificada ? 'Quitar verificación' : 'Confirmar verificación'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}