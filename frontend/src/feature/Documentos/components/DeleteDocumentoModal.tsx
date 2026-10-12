import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { Documento } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteDocumentoModalProps {
    documento: Documento | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteDocumentoModal({ documento, onHide, onDeleted }: DeleteDocumentoModalProps) {
    const handleCambiarEstado = async () => {
        if (!documento) return;

        const estabaActivo = documento.activo;

        try {
            await api.patch<Documento>(`/documentos/${documento.id}/estado`);
            mostrarAlertaExito(`El documento '${documento.nombre}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
            onDeleted();
        } catch (error: any){
            let mensajeFinal = "No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} el documento '${documento.nombre}'."
            if (error.response?.data?.detail){      
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        } finally {
            onHide();
        }
    };

    const estaActivo = documento?.activo ?? true;

    return (
        <Modal show={documento !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} documento</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? 'dar de baja' : 'dar de alta'} el documento <strong>{documento?.nombre}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant={estaActivo ? "danger" : "success"} onClick={handleCambiarEstado}>
                    {estaActivo ? 'Dar de baja' : 'Dar de alta'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
